export class CreateExamDto {
  patientId: string;
  modality: any;
  date: Date;
}

enum DICOM {
  CR,
  CT,
  DX,
  MG,
  MR,
  NM,
  OT,
  PT,
  RF,
  US,
  XA,
}
