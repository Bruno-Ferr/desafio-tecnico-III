import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '../../services/patient-data';
import { ListComponent } from '../../components/list-component/list-component';
import { PageEvent } from '@angular/material/paginator';
import { Location, DatePipe } from '@angular/common';
import { ExamDialog } from '../../components/exam-dialog/exam-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ExamData } from '../../services/exam-data';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-exams',
  imports: [ListComponent, MatDialogModule, MatButtonModule, DatePipe],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})
export class Exams {
  pacienteId: string | null = null;
  patientInfo: any = null; // Informações do paciente

  exams: any[] = [];
  isLoading = true; 
  totalItems: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  pageSizeOptions: number[] = [5, 10, 15];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private examsService: ExamData,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.patientInfo = navigation.extras.state['patient'];
    }

    if (!this.patientInfo && history.state && history.state.patient) {
      this.patientInfo = history.state.patient;
    }
    
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

  openNewExamDialog() {   
    if (!this.pacienteId) {
      console.error('Cannot open exam dialog: patient ID is null');
      return;
    }
    
    const dataToPass = { patientId: this.pacienteId };
    
    const dialogRef = this.dialog.open(ExamDialog, {
      width: '500px',
      data: dataToPass
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const idempotencyKey = this.generateIdempotencyKey();
        
        this.examsService.createExam(result, idempotencyKey).subscribe({
          next: () => {
            this.showToast('Exame cadastrado com sucesso!', 'success');
            this.loadExamsData(this.pacienteId!);
          },
          error: (error) => {
            console.error('Erro após todas as tentativas:', error);
            this.showToast('Erro ao cadastrar exame após várias tentativas.', 'error');
          }
        });
      }
    });
  }

  generateIdempotencyKey(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${this.pacienteId}-${timestamp}-${random}`;
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this._snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right', 
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'toast-success' : 'toast-error'
    });
  }

  voltar(): void {
    this.location.back();
  }
}
