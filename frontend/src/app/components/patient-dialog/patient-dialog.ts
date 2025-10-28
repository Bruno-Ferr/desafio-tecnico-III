import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PacientForm } from '../../pages/pacient-form/pacient-form';
import { Paciente } from '../../pages/pacient-form/pacient-form';

@Component({
  selector: 'app-patient-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, PacientForm],
  template: `
    <h2 mat-dialog-title>Novo Paciente</h2>
    <mat-dialog-content>
      <app-pacient-form 
        (save)="onSave($event)"
        (cancel)="onClose()">
      </app-pacient-form>
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
export class PatientDialog {
  constructor(private dialogRef: MatDialogRef<PatientDialog>) {}

  onSave(patient: Paciente) {
    this.dialogRef.close(patient);
  }

  onClose() {
    this.dialogRef.close();
  }
}