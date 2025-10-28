import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { PrismaService } from '../prisma/prisma.service';
import { DICOM } from '@prisma/client';

describe('ExamService', () => {
  let service: ExamService;
  let prisma: PrismaService;

  const mockPrismaService = {
    exams: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validExamDto = {
      patientId: 'patient-123',
      modality: DICOM.CT,
      date: new Date(),
    };

    it('deve criar um exame com dados válidos', async () => {
      const mockPatient = {
        id: 'patient-123',
        name: 'João Silva',
        age: 35,
        cpf: '12345678901',
      };

      const mockExam = {
        id: 'exam-123',
        ...validExamDto,
        idempotencyKey: 'test-key-001',
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrismaService.exams.findUnique.mockResolvedValue(null);
      mockPrismaService.exams.create.mockResolvedValue(mockExam);

      const result = await service.create(validExamDto, 'test-key-001');

      expect(result).toEqual(mockExam);
      expect(prisma.exams.create).toHaveBeenCalledWith({
        data: {
          ...validExamDto,
          idempotencyKey: 'test-key-001',
        },
      });
    });

    it('deve retornar exame existente quando idempotencyKey já existe', async () => {
      const mockPatient = {
        id: 'patient-123',
        name: 'João Silva',
        age: 35,
        cpf: '12345678901',
      };

      const existingExam = {
        id: 'exam-123',
        ...validExamDto,
        idempotencyKey: 'duplicate-key',
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrismaService.exams.findUnique.mockResolvedValue(existingExam);

      const result = await service.create(validExamDto, 'duplicate-key');

      expect(result).toEqual(existingExam);
      expect(prisma.exams.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando patientId é null', async () => {
      const invalidDto = {
        patientId: null as any,
        modality: DICOM.CT,
        date: new Date(),
      };

      await expect(service.create(invalidDto, 'test-key')).rejects.toThrow(
        'patientId é obrigatório para criar um exame',
      );
    });

    it('deve lançar erro quando modality está vazia', async () => {
      const invalidDto = {
        patientId: 'patient-123',
        modality: '' as any,
        date: new Date(),
      };

      await expect(service.create(invalidDto, 'test-key')).rejects.toThrow(
        'modality é obrigatório para criar um exame',
      );
    });

    it('deve lançar erro quando paciente não existe', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.create(validExamDto, 'test-key')).rejects.toThrow(
        'Paciente com ID patient-123 não encontrado',
      );
    });

    it('deve lançar erro quando modalidade não é suportada', async () => {
      const mockPatient = {
        id: 'patient-123',
        name: 'João Silva',
        age: 35,
        cpf: '12345678901',
      };

      const invalidDto = {
        patientId: 'patient-123',
        modality: 'INVALID' as any,
        date: new Date(),
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrismaService.exams.findUnique.mockResolvedValue(null);

      await expect(service.create(invalidDto, 'test-key')).rejects.toThrow(
        'Modalidade INVALID não é suportada',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de exames', async () => {
      const mockExams = [
        {
          id: '1',
          patientId: 'patient-1',
          modality: DICOM.CT,
          date: new Date(),
          idempotencyKey: 'key-1',
        },
        {
          id: '2',
          patientId: 'patient-2',
          modality: DICOM.MR,
          date: new Date(),
          idempotencyKey: 'key-2',
        },
      ];

      mockPrismaService.exams.count.mockResolvedValue(2);
      mockPrismaService.exams.findMany.mockResolvedValue(mockExams);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        items: mockExams,
        totalCount: 2,
      });
      expect(prisma.exams.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('deve calcular corretamente o skip para paginação', async () => {
      mockPrismaService.exams.count.mockResolvedValue(50);
      mockPrismaService.exams.findMany.mockResolvedValue([]);

      await service.findAll(3, 10);

      expect(prisma.exams.findMany).toHaveBeenCalledWith({
        skip: 20, // (3-1) * 10
        take: 10,
      });
    });
  });

  describe('isAvaliableModality', () => {
    it('deve retornar true para modalidades válidas', () => {
      const validModalities: DICOM[] = [
        DICOM.CR,
        DICOM.CT,
        DICOM.DX,
        DICOM.MG,
        DICOM.MR,
        DICOM.NM,
        DICOM.OT,
        DICOM.PT,
        DICOM.RF,
        DICOM.US,
        DICOM.XA,
      ];

      validModalities.forEach((modality) => {
        expect(service.isAvaliableModality(modality)).toBe(true);
      });
    });

    it('deve retornar false para modalidades inválidas', () => {
      const invalidModality = 'INVALID' as DICOM;
      expect(service.isAvaliableModality(invalidModality)).toBe(false);
    });
  });
});
