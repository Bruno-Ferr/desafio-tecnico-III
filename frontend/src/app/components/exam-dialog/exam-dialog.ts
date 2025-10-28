import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ExamsForm } from '../../pages/exams-form/exams-form';
import { Exam } from '../../pages/exams-form/exams-form';

@Component({
  selector: 'app-exam-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ExamsForm],
  template: `
    <h2 mat-dialog-title>Novo exame</h2>
    <mat-dialog-content>
      <app-exams-form 
        (save)="onSave($event)"
        (cancel)="onClose()">
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
  constructor(private dialogRef: MatDialogRef<ExamDialog>) {}

  onSave(exam: Exam) {
    this.dialogRef.close(exam);
  }

  onClose() {
    this.dialogRef.close();
  }
}