import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FinanceDataModel } from '../../finance/models/finance-data.model';
import { PaymentMethods } from 'src/app/finance/enums/payment-methods.enum';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private httpClient: HttpClient) {}
  baseURL = `${environment.apiUrl}dashboard/`;

  getStudentDashboardSummary(
    studentNumber: string
  ): Observable<StudentDashboardSummary> {
    return this.httpClient.get<StudentDashboardSummary>(
      `${this.baseURL}student/${studentNumber}`
    );
  }
}
