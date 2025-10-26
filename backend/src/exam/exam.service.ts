import { Injectable } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto, idempotencyKey: string) {
    if (createExamDto.patientId == null) {
      throw new Error('patientId é obrigatório para criar um exame');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: createExamDto.patientId },
    });

    if (!patient) {
      throw new Error(
        `Paciente com ID ${createExamDto.patientId} não encontrado.`,
      );
    }

    const existingExam = await this.prisma.exam.findUnique({
      where: { idempotencyKey: idempotencyKey },
    });

    if (existingExam) {
      return existingExam;
    }

    try {
      const newExam = await this.prisma.exam.create({
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

        const examCreatedByRace = await this.prisma.exam.findUnique({
          where: { idempotencyKey: idempotencyKey },
        });

        return examCreatedByRace;
      }
      throw new Error('Erro ao criar exame');
    }
  }

  findAll(pageSize: number, page: number) {
    return this.prisma.exam.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} exam`;
  }
}
