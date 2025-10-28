import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExamsForm } from '../../pages/exams-form/exams-form';
import { Exam } from '../../pages/exams-form/exams-form';

export interface ExamDialogData {
  patientId: string | null;
}

@Component({
  selector: 'app-exam-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ExamsForm],
  template: `
    <div>
      <h2 mat-dialog-title>Novo exame</h2>
      <button mat-icon-button (click)="onClose()" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; cursor: pointer;">
        X
      </button>
    </div>
    <mat-dialog-content>
      <app-exams-form 
        [patientId]="patientId"
        (save)="onSave($event)"
        (cancel)="onClose()"
      >
      </app-exams-form>
    </mat-dialog-content>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
      min-width: 400px;
    }
  `]
})
export class ExamDialog {
  patientId: string = '';
  
  constructor(
    private dialogRef: MatDialogRef<ExamDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ExamDialogData | null
  ) {
    this.patientId = data?.patientId || '';
  }
  

  onSave(exam: Exam) {
    this.dialogRef.close(exam);
  }

  onClose() {
    this.dialogRef.close();
  }
}