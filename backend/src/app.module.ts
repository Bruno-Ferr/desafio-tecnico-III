import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './patient/patient.module';
import { ExamModule } from './exam/exam.module';
import { ExamsModule } from './exams/exams.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [PatientModule, ExamsModule, ExamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
