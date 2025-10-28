import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PatientController', () => {
  let controller: PatientController;
  let service: PatientService;

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
      controllers: [PatientController],
      providers: [
        PatientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create method from service', async () => {
    const createDto = {
      name: 'Test Patient',
      age: 30,
      cpf: '12345678901',
    };

    const mockPatient = {
      id: '123',
      ...createDto,
    };

    mockPrismaService.patient.findUnique.mockResolvedValue(null);
    mockPrismaService.patient.create.mockResolvedValue(mockPatient);

    const result = await controller.create(createDto);

    expect(result).toEqual(mockPatient);
  });

  it('should call findAll method from service', async () => {
    const mockPatients = {
      items: [],
      totalCount: 0,
    };

    mockPrismaService.patient.count.mockResolvedValue(0);
    mockPrismaService.patient.findMany.mockResolvedValue([]);

    const result = await controller.findAll(1, 10);

    expect(result).toEqual(mockPatients);
  });
});
