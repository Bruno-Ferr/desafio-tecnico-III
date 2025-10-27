import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse, PatientData } from '../../services/patient-data';
import { ListComponent } from '../../list-component/list-component';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';

@Component({
  selector: 'app-exams',
  imports: [ListComponent],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})
export class Exams {
  pacienteId: string | null = null;

  exams: any[] = [];
  isLoading = true; 
  totalItems: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  pageSizeOptions: number[] = [5, 10, 15];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private examsService: PatientData
  ) { }

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
  
    if (this.pacienteId) {
      this.loadExamsData(this.pacienteId);
    }
  }

  loadExamsData(pacientId: string): void {
    this.isLoading = true;
    this.examsService.getItens(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: ApiResponse) => {
        this.exams = response.items;
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
    if (this.pacienteId) {
      this.loadExamsData(this.pacienteId);
    }
  }

  voltar(): void {
    this.location.back();
  }
}
