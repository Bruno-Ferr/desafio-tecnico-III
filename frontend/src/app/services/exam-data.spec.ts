import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExamData } from './exam-data';

describe('ExamData', () => {
  let service: ExamData;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/exames';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExamData]
    });
    service = TestBed.inject(ExamData);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItens', () => {
    it('Cenário 7: deve retornar lista paginada de exames', () => {
      const mockResponse = {
        items: [
          { id: '1', patientId: 'p1', modality: 'CT', date: new Date().toISOString(), idempotencyKey: 'key1' },
          { id: '2', patientId: 'p1', modality: 'MR', date: new Date().toISOString(), idempotencyKey: 'key2' }
        ],
        totalCount: 2
      };

      service.getItens(0, 10).subscribe((response: any) => {
        expect(response.items.length).toBe(2);
        expect(response.totalCount).toBe(2);
        expect(response.items[0].modality).toBe('CT');
      });

      const req = httpMock.expectOne(`${baseUrl}?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve fazer requisição com parâmetros de paginação corretos', () => {
      const mockResponse = { items: [], totalCount: 0 };

      service.getItens(1, 5).subscribe();

      const req = httpMock.expectOne(`${baseUrl}?page=2&pageSize=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createExam', () => {
    it('Cenário 3: deve criar exame com idempotencyKey no header', () => {
      const newExam = {
        patientId: 'patient-123',
        modality: 'CT',
        date: new Date().toISOString()
      };

      const idempotencyKey = 'test-key-001';

      const mockResponse = {
        id: 'exam-123',
        ...newExam,
        idempotencyKey
      };

      service.createExam(newExam, idempotencyKey).subscribe((response: any) => {
        expect(response.id).toBe('exam-123');
        expect(response.patientId).toBe(newExam.patientId);
        expect(response.modality).toBe(newExam.modality);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-Idempotency-Key')).toBe(idempotencyKey);
      expect(req.request.body).toEqual(newExam);
      req.flush(mockResponse);
    });

    it('Cenário 4: deve retornar mesmo exame ao reenviar com mesma idempotencyKey', () => {
      const exam = {
        patientId: 'patient-123',
        modality: 'MR',
        date: new Date().toISOString()
      };

      const idempotencyKey = 'duplicate-key';
      const existingExam = {
        id: 'exam-existing',
        ...exam,
        idempotencyKey
      };

      service.createExam(exam, idempotencyKey).subscribe((response: any) => {
        expect(response.id).toBe('exam-existing');
        expect(response.idempotencyKey).toBe(idempotencyKey);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.headers.get('X-Idempotency-Key')).toBe(idempotencyKey);
      req.flush(existingExam);
    });

    it('Cenário 6: deve retornar erro ao criar exame com paciente inexistente', () => {
      const invalidExam = {
        patientId: 'invalid-patient-id',
        modality: 'CT',
        date: new Date().toISOString()
      };

      service.createExam(invalidExam, 'key-001').subscribe({
        next: () => fail('should have failed with patient not found error'),
        error: (error: any) => {
          expect(error.status).toBe(500);
          expect(error.error.message).toContain('não encontrado');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Paciente com ID invalid-patient-id não encontrado' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('Cenário 11: deve retornar erro com modalidade DICOM inválida', () => {
      const invalidExam = {
        patientId: 'patient-123',
        modality: 'INVALID_MODALITY',
        date: new Date().toISOString()
      };

      service.createExam(invalidExam, 'key-001').subscribe({
        next: () => fail('should have failed with invalid modality error'),
        error: (error: any) => {
          expect(error.status).toBe(500);
          expect(error.error.message).toContain('não é suportada');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Modalidade INVALID_MODALITY não é suportada' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('Cenário 9 e 10: deve fazer retry em caso de erro de rede (3 tentativas)', () => {
      const exam = {
        patientId: 'patient-123',
        modality: 'CT',
        date: new Date().toISOString()
      };

      let attemptCount = 0;

      service.createExam(exam, 'retry-key').subscribe({
        next: () => fail('should have failed after retries'),
        error: (error: any) => {
          expect(attemptCount).toBe(4); // 1 original + 3 retries
          expect(error.status).toBe(0);
        }
      });

      // Primeira tentativa
      const req1 = httpMock.expectOne(baseUrl);
      attemptCount++;
      req1.error(new ProgressEvent('error'), { status: 0 });

      // Retry 1
      const req2 = httpMock.expectOne(baseUrl);
      attemptCount++;
      req2.error(new ProgressEvent('error'), { status: 0 });

      // Retry 2
      const req3 = httpMock.expectOne(baseUrl);
      attemptCount++;
      req3.error(new ProgressEvent('error'), { status: 0 });

      // Retry 3
      const req4 = httpMock.expectOne(baseUrl);
      attemptCount++;
      req4.error(new ProgressEvent('error'), { status: 0 });
    });
  });
});
