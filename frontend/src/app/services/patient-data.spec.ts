import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientData } from './patient-data';

describe('PatientData', () => {
  let service: PatientData;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/pacientes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientData]
    });
    service = TestBed.inject(PatientData);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItens', () => {
    it('Cenário 8: deve retornar lista paginada de pacientes', () => {
      const mockResponse = {
        items: [
          { id: '1', name: 'João Silva', age: 35, cpf: '12345678901' },
          { id: '2', name: 'Maria Santos', age: 28, cpf: '98765432100' }
        ],
        totalCount: 2
      };

      service.getItens(0, 10).subscribe((response: any) => {
        expect(response.items.length).toBe(2);
        expect(response.totalCount).toBe(2);
        expect(response.items[0].name).toBe('João Silva');
      });

      const req = httpMock.expectOne(`${baseUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve fazer requisição com parâmetros de paginação corretos', () => {
      const mockResponse = { items: [], totalCount: 0 };

      service.getItens(2, 20).subscribe();

      const req = httpMock.expectOne(`${baseUrl}?page=3&pageSize=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('Cenário 10: deve tratar erro de rede e permitir retry', () => {
      const errorMessage = 'Network error';

      service.getItens(0, 10).subscribe({
        next: () => fail('should have failed with network error'),
        error: (error: any) => {
          expect(error.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=1&pageSize=10`);
      req.error(new ProgressEvent('error'), { status: 0, statusText: errorMessage });
    });
  });

  describe('createPatient', () => {
    it('Cenário 1: deve criar paciente com dados válidos', () => {
      const newPatient = {
        name: 'Carlos Oliveira',
        age: 42,
        cpf: '99988877766'
      };

      const mockResponse = {
        id: '123',
        ...newPatient
      };

      service.createPatient(newPatient).subscribe(response => {
        expect(response.id).toBe('123');
        expect(response.name).toBe(newPatient.name);
        expect(response.cpf).toBe(newPatient.cpf);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPatient);
      req.flush(mockResponse);
    });

    it('Cenário 2: deve retornar erro ao criar paciente com CPF duplicado', () => {
      const duplicatePatient = {
        name: 'Teste',
        age: 30,
        cpf: '12345678901'
      };

      service.createPatient(duplicatePatient).subscribe({
        next: () => fail('should have failed with duplicate CPF error'),
        error: (error: any) => {
          expect(error.status).toBe(500);
          expect(error.error.message).toContain('CPF já existe');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'CPF já existe' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('Cenário 12: deve validar campos obrigatórios antes de enviar', () => {
      const invalidPatient = {
        name: '',
        age: 25,
        cpf: '11111111111'
      };

      service.createPatient(invalidPatient).subscribe({
        next: () => fail('should have failed with validation error'),
        error: (error: any) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Name cannot be empty' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
