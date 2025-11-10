import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, timeout, catchError, throwError } from 'rxjs';
import { InvoiceModel } from '../models/invoice.model';
import { environment } from 'src/environments/environment';
import { InvoiceStatsModel } from '../models/invoice-stats.model';
import { ReceiptModel } from '../models/payment.model';
import { PaymentMethods } from '../enums/payment-methods.enum';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  baseURL = `${environment.apiUrl}/payment/`;

  constructor(private httpClient: HttpClient) {}
  getInvoice(
    studentNumber: string,
    num: number,
    year: number
  ): Observable<InvoiceModel> {
    return this.httpClient
      .get<InvoiceModel>(
        `${this.baseURL}invoice/${studentNumber}/${num}/${year}`
      )
      .pipe(
        timeout(30000), // 30 second timeout
        map((invoice) => {
          // Ensure balanceBfwd and its amount exist and convert if it's a string
          if (
            invoice.balanceBfwd &&
            typeof invoice.balanceBfwd.amount === 'string'
          ) {
            invoice.balanceBfwd.amount = parseFloat(invoice.balanceBfwd.amount);
          }
          // Apply similar conversions for other numeric fields if needed
          // ...
          return invoice;
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  getInvoiceStats(num: number, year: number): Observable<InvoiceStatsModel[]> {
    return this.httpClient.get<InvoiceStatsModel[]>(
      `${this.baseURL}invoice/stats/${num}/${year}`
    );
  }

  getTermInvoices(num: number, year: number): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/${num}/${year}`
    );
  }

  getAllInvoices(): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(`${this.baseURL}invoice/`);
  }

  saveInvoice(invoice: InvoiceModel): Observable<InvoiceModel> {
    // console.log(invoice);
    return this.httpClient.post<InvoiceModel>(
      `${this.baseURL}invoice`,
      invoice
    );
  }
  downloadInvoice(invoiceNumber: string): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(
      `${this.baseURL}invoicepdf/${invoiceNumber}`, // Use baseURL + specific endpoint
      {
        responseType: 'blob',
        observe: 'response', // <--- Crucial change: observe the full response
      }
    );
  }

  getStudentOutstandingBalance(
    studentNumber: string
  ): Observable<{ amountDue: number }> {
    return this.httpClient.get<{ amountDue: number }>(
      `${this.baseURL}studentBalance/${studentNumber}`
    );
  }

  getAllReceipts(): Observable<ReceiptModel[]> {
    return this.httpClient.get<ReceiptModel[]>(`${this.baseURL}receipt/`);
  }

  saveReceipt(
    studentNumber: string,
    amountPaid: number,
    paymentMethod: PaymentMethods,
    description?: string
  ): Observable<ReceiptModel> {
    return this.httpClient.post<ReceiptModel>(`${this.baseURL}receipt/`, {
      studentNumber,
      amountPaid,
      paymentMethod,
      description,
    });
  }

  downloadReceipt(receiptNumber: string): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(
      `${this.baseURL}receiptpdf/${receiptNumber}`, // Use baseURL + specific endpoint
      {
        responseType: 'blob',
        observe: 'response', // <--- Crucial change: observe the full response
      }
    );
  }

  getStudentInvoices(studentNumber: string): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/${studentNumber}`
    );
  }

  getStudentReceipts(studentNumber: string): Observable<ReceiptModel[]> {
    return this.httpClient.get<ReceiptModel[]>(
      `${this.baseURL}receipt/student/${studentNumber}`
    );
  }

  voidReceipt(receiptId: number): Observable<ReceiptModel> {
    return this.httpClient.patch<ReceiptModel>(
      `${this.baseURL}receipt/void/${receiptId}`,
      {}
    );
  }

  voidInvoice(invoiceId: number): Observable<InvoiceModel> {
    return this.httpClient.patch<InvoiceModel>(
      `${this.baseURL}invoice/void/${invoiceId}`,
      {}
    );
  }

  // Data Repair Service Methods
  auditDataIntegrity(): Observable<any> {
    return this.httpClient.get(`${this.baseURL}repair/audit`);
  }

  verifyAmountPaidOnInvoice(): Observable<any> {
    return this.httpClient.get(`${this.baseURL}repair/verify-amount-paid`);
  }

  generateRepairReport(): Observable<any> {
    return this.httpClient.get(`${this.baseURL}repair/report`);
  }

  repairInvoiceBalances(dryRun: boolean = true): Observable<any> {
    return this.httpClient.post(`${this.baseURL}repair/balances`, { dryRun });
  }

  repairVoidedReceipts(dryRun: boolean = true): Observable<any> {
    return this.httpClient.post(`${this.baseURL}repair/voided-receipts`, { dryRun });
  }

  repairMissingCreditAllocations(dryRun: boolean = true): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseURL}repair/missing-credit-allocations`,
      { dryRun }
    );
  }

  repairUnallocatedReceiptAmounts(dryRun: boolean = true): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseURL}repair/unallocated-receipt-amounts`,
      { dryRun }
    );
  }

  repairUnrecordedCredits(dryRun: boolean = true): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseURL}repair/unrecorded-credits`,
      { dryRun }
    );
  }

  repairAllData(dryRun: boolean = true): Observable<any> {
    return this.httpClient.post(`${this.baseURL}repair/all`, { dryRun });
  }
}
