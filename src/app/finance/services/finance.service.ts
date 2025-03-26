import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FeesModel } from '../models/fees.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  baseURL = `${environment.apiUrl}finance/`;

  constructor(private httpClient: HttpClient) {}

  getAllFees(): Observable<FeesModel[]> {
    return this.httpClient.get<FeesModel[]>(`${this.baseURL}fees/`);
  }

  createFee(fee: FeesModel): Observable<FeesModel> {
    return this.httpClient.post<FeesModel>(`${this.baseURL}fees/`, fee);
  }

  editFees(id: number, fee: FeesModel): Observable<FeesModel> {
    return this.httpClient.patch<FeesModel>(`${this.baseURL}fees/${id}`, fee);
  }

  deleteFees(id: number): Observable<FeesModel> {
    return this.httpClient.delete<FeesModel>(`${this.baseURL}fees/${id}`);
  }
}
