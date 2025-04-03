import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceModel } from '../models/invoice.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  baseURL = `${environment.apiUrl}payment/`;

  constructor(private httpClient: HttpClient) {}
  getInvoice(studentNumber: string): Observable<InvoiceModel> {
    return this.httpClient.get<InvoiceModel>(
      `${this.baseURL}invoice/${studentNumber}`
    );
  }
}
