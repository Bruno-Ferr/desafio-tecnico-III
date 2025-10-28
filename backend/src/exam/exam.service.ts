import { Injectable } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DICOM } from '@prisma/client';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto, idempotencyKey: string) {
    if (createExamDto.patientId == null) {
      throw new Error('patientId é obrigatório para criar um exame');
    }

    if (!createExamDto.modality) {
      throw new Error('modality é obrigatório para criar um exame');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: createExamDto.patientId },
    });

    if (!patient) {
      throw new Error(
        `Paciente com ID ${createExamDto.patientId} não encontrado.`,
      );
    }

    if (!this.isAvaliableModality(createExamDto.modality)) {
      throw new Error(`Modalidade ${createExamDto.modality} não é suportada.`);
    }

    const existingExam = await this.prisma.exams.findUnique({
      where: { idempotencyKey: idempotencyKey },
    });

    if (existingExam) {
      return existingExam;
    }

    try {
      const newExam = await this.prisma.exams.create({
        data: {
          ...createExamDto,
          idempotencyKey: idempotencyKey,
        },
      });
      return newExam;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        console.log(
          'Race condition de idempotência detectada. Re-buscando exame...',
        );

        const examCreatedByRace = await this.prisma.exams.findUnique({
          where: { idempotencyKey: idempotencyKey },
        });

        return examCreatedByRace;
      }
      throw new Error('Erro ao criar exame');
    }
  }

  async findAll(page: number, pageSize: number) {
    const totalCount = await this.prisma.exams.count();

    const exams = await this.prisma.exams.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items: exams, totalCount };
  }

  findOne(id: number) {
    return `This action returns a #${id} exam`;
  }

  isAvaliableModality(modality: DICOM): boolean {
    return [
      'CR',
      'CT',
      'DX',
      'MG',
      'MR',
      'NM',
      'OT',
      'PT',
      'RF',
      'US',
      'XA',
    ].includes(modality);
  }
}
