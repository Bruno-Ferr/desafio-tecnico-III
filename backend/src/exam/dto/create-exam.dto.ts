import { DICOM } from '@prisma/client';

export class CreateExamDto {
  patientId: string;
  modality: DICOM;
  date: Date;
}
