import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ListComponent } from '../../components/list-component/list-component';

import { ApiResponse, PatientData } from '../../services/patient-data';
import { PatientDialog } from '../../components/patient-dialog/patient-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    MatPaginatorModule, 
    MatProgressSpinnerModule, 
    CommonModule, 
    ListComponent, 
    RouterModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  constructor(
    private patientService: PatientData,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  paginatedItems: any[] = [];
  listType: 'patients' | 'exams' = 'patients';
  isLoading = true; 

  totalItems: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  pageSizeOptions: number[] = [5, 10, 15];

  ngOnInit(): void {
    this.loadPatientData();
  }

  loadPatientData(): void {
    this.isLoading = true;
    this.patientService.getItens(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: ApiResponse) => {
        this.paginatedItems = response.items;
        this.totalItems = response.totalCount;
        this.isLoading = false;
      },
      error: () => {
        console.error('Error fetching patient data');
        this.isLoading = false;
      }
    });
  }

  handlePageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    this.loadPatientData();
  }

  openNewPatientDialog() {
    const dialogRef = this.dialog.open(PatientDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.createPatient(result).subscribe({
          next: (response) => {
            this.showToast('Paciente cadastrado com sucesso!', 'success');
            this.loadPatientData();
          },
          error: (error) => {
            this.showToast('Erro ao cadastrar paciente!', 'error');
            console.log('Erro ao criar paciente:', error);
          }
        });
      }
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this._snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right', 
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'toast-success' : 'toast-error'
    });
  }
}
