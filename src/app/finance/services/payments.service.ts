import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceModel } from '../models/invoice.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  baseURL = `${environment.apiUrl}payment/`;

  constructor(private httpClient: HttpClient) {}
  getInvoice(
    studentNumber: string,
    num: number,
    year: number
  ): Observable<InvoiceModel> {
    return this.httpClient.get<InvoiceModel>(
      `${this.baseURL}invoice/${studentNumber}/${num}/${year}`
    );
  }

  downloadInvoice(studentNumber: string, num: number, year: number) {
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
}
