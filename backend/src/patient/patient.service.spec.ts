import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PatientService', () => {
  let service: PatientService;
  let prisma: PrismaService;

  const mockPrismaService = {
    patient: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um paciente com dados válidos', async () => {
      const createPatientDto = {
        name: 'João Silva',
        age: 35,
        cpf: '12345678901',
      };

      const mockPatient = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createPatientDto,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(null);
      mockPrismaService.patient.create.mockResolvedValue(mockPatient);

      const result = await service.create(createPatientDto);

      expect(result).toEqual(mockPatient);
      expect(prisma.patient.create).toHaveBeenCalledWith({
        data: createPatientDto,
      });
    });

    it('deve lançar erro quando o nome está vazio', async () => {
      const createPatientDto = {
        name: '',
        age: 35,
        cpf: '12345678901',
      };

      await expect(service.create(createPatientDto)).rejects.toThrow(
        'Name cannot be empty',
      );
    });

    it('deve lançar erro quando o CPF está vazio', async () => {
      const createPatientDto = {
        name: 'João Silva',
        age: 35,
        cpf: '',
      };

      await expect(service.create(createPatientDto)).rejects.toThrow(
        'CPF cannot be empty',
      );
    });

    it('deve lançar erro quando o CPF já existe', async () => {
      const createPatientDto = {
        name: 'Maria Santos',
        age: 28,
        cpf: '98765432100',
      };

      const existingPatient = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Outro Nome',
        age: 30,
        cpf: '98765432100',
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(existingPatient);

      await expect(service.create(createPatientDto)).rejects.toThrow(
        'CPF já existe',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de pacientes', async () => {
      const mockPatients = [
        {
          id: '1',
          name: 'Paciente 1',
          age: 25,
          cpf: '11111111111',
        },
        {
          id: '2',
          name: 'Paciente 2',
          age: 30,
          cpf: '22222222222',
        },
      ];

      mockPrismaService.patient.count.mockResolvedValue(2);
      mockPrismaService.patient.findMany.mockResolvedValue(mockPatients);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        items: mockPatients,
        totalCount: 2,
      });
      expect(prisma.patient.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('deve calcular corretamente o skip para paginação', async () => {
      mockPrismaService.patient.count.mockResolvedValue(50);
      mockPrismaService.patient.findMany.mockResolvedValue([]);

      await service.findAll(3, 10);

      expect(prisma.patient.findMany).toHaveBeenCalledWith({
        skip: 20, // (3-1) * 10
        take: 10,
      });
    });
  });

  describe('findOneByCPF', () => {
    it('deve encontrar paciente pelo CPF', async () => {
      const mockPatient = {
        id: '1',
        name: 'João Silva',
        age: 35,
        cpf: '12345678901',
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);

      const result = await service.findOneByCPF('12345678901');

      expect(result).toEqual(mockPatient);
      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { cpf: '12345678901' },
      });
    });

    it('deve retornar null quando paciente não existe', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      const result = await service.findOneByCPF('99999999999');

      expect(result).toBeNull();
    });
  });
});
