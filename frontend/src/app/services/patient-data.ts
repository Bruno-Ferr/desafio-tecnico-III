import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ApiResponse {
  items: any[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientData {
  private apiUrl = 'http://localhost:3000/pacientes';

  constructor(private http: HttpClient) { }

  getItens(page: number, pageSize: number): Observable<ApiResponse> {

    const pageApi = (page + 1).toString();
    const limitApi = pageSize.toString();

    const params = new HttpParams()
      .set('_page', pageApi)
      .set('_limit', limitApi);

    return this.http.get<any[]>(this.apiUrl, { 
      params: params,
      observe: 'response' 
    }).pipe(
      map(response => {
        const totalCount = Number(response.headers.get('x-total-count'));
        const items = response.body || [];
        
        return { items, totalCount };
      })
    );
  }
}
