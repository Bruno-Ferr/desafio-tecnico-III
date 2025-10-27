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
      .set('page', pageApi)
      .set('pageSize', limitApi);

    return this.http.get<ApiResponse>(this.apiUrl, { 
      params: params,
      observe: 'response' 
    }).pipe(
      map(response => {
        console.log(response.body)
        const totalCount = response.body?.totalCount || 0;
        const items = response.body?.items || [];
        
        return { items, totalCount };
      })
    );
  }
}
