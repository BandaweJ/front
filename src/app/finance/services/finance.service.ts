import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FeesModel } from '../models/fees.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';

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

  deleteFees(id: number): Observable<number> {
    // console.log(id);
    return this.httpClient.delete<number>(`${this.baseURL}fees/${id}`);
  }

  getStudentsNotYetBilledForTerm(
    num: number,
    year: number
  ): Observable<EnrolsModel[]> {
    return this.httpClient.get<EnrolsModel[]>(
      `${this.baseURL}billing/tobill/${num}/${year}`
    );
  }

  createFeesBalance(balance: BalancesModel): Observable<BalancesModel> {
    return this.httpClient.post<BalancesModel>(
      `${this.baseURL}fees/balance/`,
      balance
    );
  }
}
