import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportsModel } from '../models/reports.model';
import { ReportModel } from '../models/report.model';
import { HeadCommentModel } from '../models/comment.model';
import { environment } from 'src/environments/environment';
import { ExamType } from 'src/app/marks/models/examtype.enum';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private httpClient: HttpClient) {}

  baseUrl = environment.apiUrl + 'reports/';

  generateReports(
    name: string,
    num: number,
    year: number,
    examType: ExamType
  ): Observable<ReportsModel[]> {
    // console.log(`${this.baseUrl}generate/${name}/${num}/${year}/`);
    return this.httpClient.get<ReportsModel[]>(
      `${this.baseUrl}generate/${name}/${num}/${year}/${examType}`
    );
  }

  saveReports(
    name: string,
    num: number,
    year: number,
    reports: ReportsModel[]
  ): Observable<ReportsModel[]> {
    return this.httpClient.post<ReportsModel[]>(
      `${this.baseUrl}save/${name}/${num}/${year}/`,
      reports
    );
  }

  saveHeadComment(comment: HeadCommentModel): Observable<ReportsModel> {
    return this.httpClient.post<ReportsModel>(`${this.baseUrl}save/`, comment);
  }

  viewReports(
    name: string,
    num: number,
    year: number
  ): Observable<ReportsModel[]> {
    return this.httpClient.get<ReportsModel[]>(
      `${this.baseUrl}view/${name}/${num}/${year}/`
    );
  }

  downloadReport(
    name: string,
    num: number,
    year: number,
    examType: string,
    studentNumber: string
  ) {
    const result = this.httpClient.get(
      `${this.baseUrl}pdf/${name}/${num}/${year}/${examType}/${studentNumber}`,
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
      const filename = response.headers
        .get('Content-Disposition')
        ?.split('filename=')[1];
      const blob = response.body;

      // Option 1: Save the PDF to disk (requires additional libraries)
      // Use a library like FileSaver.js to save the blob to the user's device.

      // Option 2: Open the PDF in a new browser tab/window
      const link = document.createElement('a');
      if (blob) {
        link.href = window.URL.createObjectURL(blob);
        link.target = '_blank';
        if (filename) {
          link.download = filename; // Only set download if filename is available
        }
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href); // release the blob object
      }

      // link.download = filename || 'report.pdf'; // Set default filename if not provided
    } else {
      console.error('Error downloading PDF:', response.statusText);
      // Handle potential errors
    }
  }
}
