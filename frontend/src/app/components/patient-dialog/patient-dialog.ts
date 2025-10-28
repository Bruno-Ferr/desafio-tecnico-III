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
  <div>
    <h2 mat-dialog-title>Novo Paciente</h2>
    <button mat-icon-button (click)="onClose()" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; cursor: pointer;">
      X
    </button>
  </div>
    <mat-dialog-content>
      <app-pacient-form 
        (save)="onSave($event)"
      >
      </app-pacient-form>
    </mat-dialog-content>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 500px;
    }

    h2 {
      margin: 0;
      padding: 24px 24px 16px 24px;
      font-size: 24px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #f0f0f0;
    }

    mat-dialog-content {
      padding: 0 !important;
      overflow-y: auto;
      max-height: 70vh;
    }

    @media (max-width: 600px) {
      :host {
        min-width: auto;
        width: 100%;
      }
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