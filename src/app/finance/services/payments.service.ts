import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { InvoiceModel } from '../models/invoice.model';
import { environment } from 'src/environments/environment';
import { InvoiceStatsModel } from '../models/invoice-stats.model';
import { ReceiptModel } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  baseURL = `${environment.apiUrl}payment/`;

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
        })
      );
  }

  getInvoiceStats(num: number, year: number): Observable<InvoiceStatsModel[]> {
    return this.httpClient.get<InvoiceStatsModel[]>(
      `${this.baseURL}stats/${num}/${year}`
    );
  }

  getInvoices(num: number, year: number): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/${num}/${year}`
    );
  }

  saveInvoice(invoice: InvoiceModel): Observable<InvoiceModel> {
    // console.log(invoice);
    return this.httpClient.post<InvoiceModel>(
      `${this.baseURL}invoice`,
      invoice
    );
  }

  downloadInvoice(studentNumber: string, num: number, year: number) {
    console.log('called download');
    const result = this.httpClient.get(
      `${this.baseURL}invoicepdf/${studentNumber}/${num}/${year}`,
      {
        observe: 'response',
        responseType: 'blob',
      }
    );

    result.subscribe((response: HttpResponse<Blob>) => {
      this.handlePdfResponse(response);
    });

    return result;
  }

  handlePdfResponse(response: HttpResponse<Blob>) {
    // Check for successful response
    if (response.status === 200) {
      let filename = 'invoice.pdf'; // Default filename
      const contentDisposition = response.headers.get('Content-Disposition');

      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition
          .split('filename=')[1]
          .split(';')[0]
          .trim()
          .replace(/"/g, '');
      }

      const blob = response.body;

      // Option 2: Open the PDF in a new browser tab/window and enable saving with a default filename
      const link = document.createElement('a');
      if (blob) {
        link.href = window.URL.createObjectURL(blob);
        link.target = '_blank';
        link.download = filename; // Always set a filename for saving
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href); // release the blob object
      }
    } else {
      console.error('Error downloading PDF:', response.statusText);
      // Handle potential errors
    }
  }

  getNewReceipt(studentNumber: string): Observable<ReceiptModel> {
    return this.httpClient.get<ReceiptModel>(
      `${this.baseURL}receipt/new/${studentNumber}`
    );
  }

  getReceipts(): Observable<ReceiptModel[]> {
    return this.httpClient.get<ReceiptModel[]>(`${this.baseURL}receipt/`);
  }

  saveReceipt(receipt: ReceiptModel): Observable<ReceiptModel> {
    return this.httpClient.post<ReceiptModel>(
      `${this.baseURL}receipt/`,
      receipt
    );
  }

  downloadReceipt(receipt: ReceiptModel) {
    const result = this.httpClient.get(
      `${this.baseURL}receiptpdf/${receipt.receiptNumber}`,
      {
        observe: 'response',
        responseType: 'blob',
      }
    );

    result.subscribe((response: HttpResponse<Blob>) => {
      this.handleReceiptPdfResponse(response);
    });

    return result;
  }

  handleReceiptPdfResponse(response: HttpResponse<Blob>) {
    // Check for successful response
    if (response.status === 200) {
      let filename = 'receipt.pdf';
      const contentDisposition = response.headers.get('Content-Disposition');

      if (contentDisposition && contentDisposition.includes('filename=')) {
        // Your existing extraction logic is correct for the provided header
        filename = contentDisposition
          .split('filename=')[1]
          .split(';')[0]
          .trim()
          .replace(/"/g, '');
        console.log(filename);
      }

      const blob = response.body;

      const link = document.createElement('a');
      if (blob) {
        link.href = window.URL.createObjectURL(blob);
        // *** REMOVE THIS LINE: link.target = '_blank'; ***
        link.download = filename; // This attribute suggests the filename for saving

        // Temporarily append the link to the document body, then click it, then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(link.href); // Release the blob object URL
      }
    } else {
      console.error('Error downloading PDF:', response.statusText);
      // Handle potential errors like showing a user-friendly message
    }
  }
}
