import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, retry, timer } from 'rxjs';

export interface ApiResponse {
  items: any[];
  totalCount: number;
}

export interface CreateExamRequest {
  patientId: string;
  modality: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamData {
  private apiUrl = 'http://localhost:3000/exames';

  constructor(private http: HttpClient) { }

  getItens(page: number, pageSize: number): Observable<ApiResponse> {

    const pageApi = (page + 1).toString();
    const limitApi = pageSize.toString();

    const params = new HttpParams()
      .set('page', pageApi)
      .set('pageSize', limitApi);

    return this.http.get<ApiResponse>(this.apiUrl, { 
      params: params,
      observe: 'response' 
    }).pipe(
      map(response => {
        const totalCount = response.body?.totalCount || 0;
        const items = response.body?.items || [];
        
        return { items, totalCount };
      })
    );
  }

  createExam(exam: CreateExamRequest, idempotencyKey: string): Observable<any> {
    return this.http.post(this.apiUrl, exam, {
      headers: { 'X-Idempotency-Key': idempotencyKey }
    }).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          const delayMs = Math.pow(2, retryCount - 1) * 1000;
          console.log(`Tentativa ${retryCount} falhou. Tentando novamente em ${delayMs}ms...`);
          return timer(delayMs);
        }
      })
    );
  }
}
