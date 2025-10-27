import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
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

  findOne(id: number) {
    return `This action returns a #${id} patient`;
  }
}
