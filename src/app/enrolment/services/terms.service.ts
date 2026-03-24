import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TermsModel } from '../models/terms.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TermsService {
  baseURL = `${environment.apiUrl}/enrolment/terms`;

  constructor(private httpClient: HttpClient) {}

  getAllTerms(): Observable<TermsModel[]> {
    return this.httpClient.get<TermsModel[]>(this.baseURL);
  }

  addTerm(term: TermsModel): Observable<TermsModel> {
    return this.httpClient.post<TermsModel>(this.baseURL, term);
  }

  editTerm(term: TermsModel): Observable<TermsModel> {
    const termId = this.toValidId(term.id);
    if (termId !== null) {
      return this.httpClient.patch<TermsModel>(`${this.baseURL}/id/${termId}`, term);
    }
    return this.httpClient.patch<TermsModel>(this.baseURL, term);
  }

  deleteTerm(term: TermsModel): Observable<number> {
    const termId = this.toValidId(term.id);
    if (termId !== null) {
      return this.httpClient.delete<number>(`${this.baseURL}/id/${termId}`);
    }
    return this.httpClient.delete<number>(`${this.baseURL}/${term.num}/${term.year}`);
  }

  getCurrentTerm(): Observable<TermsModel> {
    return this.httpClient.get<TermsModel>(`${this.baseURL}/current`);
  }

  private toValidId(id: unknown): number | null {
    if (id === null || id === undefined || id === '') return null;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
