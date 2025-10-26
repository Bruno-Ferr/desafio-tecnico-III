export class CreateExamDto {
  patientId: string;
  type: DICOM;
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
