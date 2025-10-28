import { Test, TestingModule } from '@nestjs/testing';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { PrismaService } from '../prisma/prisma.service';
import { DICOM } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('ExamController', () => {
  let controller: ExamController;
  let service: ExamService;

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
      controllers: [ExamController],
      providers: [
        ExamService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ExamController>(ExamController);
    service = module.get<ExamService>(ExamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw error when X-Idempotency-Key header is missing', async () => {
    const createDto = {
      patientId: 'patient-123',
      modality: DICOM.CT,
      date: new Date(),
    };

    try {
      await controller.create(createDto, undefined as any);
      fail('Should have thrown BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain('X-Idempotency-Key');
    }
  });

  it('should call create method from service with idempotency key', async () => {
    const createDto = {
      patientId: 'patient-123',
      modality: DICOM.CT,
      date: new Date(),
    };

    const mockPatient = {
      id: 'patient-123',
      name: 'Test',
      age: 30,
      cpf: '12345678901',
    };

    const mockExam = {
      id: 'exam-123',
      ...createDto,
      idempotencyKey: 'test-key-001',
    };

    mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
    mockPrismaService.exams.findUnique.mockResolvedValue(null);
    mockPrismaService.exams.create.mockResolvedValue(mockExam);

    const result = await controller.create(createDto, 'test-key-001');

    expect(result).toEqual(mockExam);
  });

  it('should call findAll method from service', async () => {
    const mockExams = {
      items: [],
      totalCount: 0,
    };

    mockPrismaService.exams.count.mockResolvedValue(0);
    mockPrismaService.exams.findMany.mockResolvedValue([]);

    const result = await controller.findAll(1, 10);

    expect(result).toEqual(mockExams);
  });
});
