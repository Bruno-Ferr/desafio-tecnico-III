import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    if (!createPatientDto.name) {
      throw new Error('Name cannot be empty');
    }
    if (!createPatientDto.cpf) {
      throw new Error('CPF cannot be empty');
    }

    const existingPatient = await this.findOneByCPF(createPatientDto.cpf);
    if (existingPatient) {
      throw new Error('CPF já existe');
    }

    return await this.prisma.patient.create({ data: createPatientDto });
  }

  async findAll(page: number, pageSize: number) {
    const totalCount = await this.prisma.patient.count();
    const items = await this.prisma.patient.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, totalCount };
  }

  async findOneByCPF(cpf: string) {
    return await this.prisma.patient.findUnique({
      where: { cpf },
    });
  }
}
