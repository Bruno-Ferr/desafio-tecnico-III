import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiResponse, PatientData } from '../services/patient-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patients',
  imports: [MatPaginatorModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  constructor(private dataService: PatientData) {}

  paginatedItems: any[] = [];
  isLoading = true; 

  totalItems: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.dataService.getItens(this.currentPage, this.itemsPerPage).subscribe({
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
    this.loadData();
  }
}
