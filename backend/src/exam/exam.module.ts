import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ExamController],
  providers: [ExamService, PrismaService],
  exports: [PrismaService],
})
export class ExamModule {}
