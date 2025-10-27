import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiResponse, PatientData } from '../../services/patient-data';
import { CommonModule } from '@angular/common';
import { ListComponent } from "../../list-component/list-component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patients',
  imports: [MatPaginatorModule, MatProgressSpinnerModule, CommonModule, ListComponent, RouterModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  constructor(private patientService: PatientData) {}

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
}
