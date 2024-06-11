import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnrolsModel } from '../models/enrols.model';
import { EnrolStats } from '../models/enrol-stats.model';
import { RegisterModel } from '../../attendance/models/register.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnrolService {
  baseURL = `${environment.apiUrl}enrolment/enrol/`;

  constructor(private httpClient: HttpClient) {}

  getEnrolmentByClass(
    name: string,
    num: number,
    year: number
  ): Observable<EnrolsModel[]> {
    return this.httpClient.get<EnrolsModel[]>(
      `${this.baseURL}${name}/${num}/${year}`
    );
  }

  enrolStudents(enrols: EnrolsModel[]): Observable<EnrolsModel[]> {
    // console.log(enrols);
    return this.httpClient.post<EnrolsModel[]>(this.baseURL, enrols);
  }

  getEnrolsStats(): Observable<EnrolStats> {
    return this.httpClient.get<EnrolStats>(this.baseURL);
  }

  getTotalEnrolment(num: number, year: number): Observable<number> {
    return this.httpClient.get<number>(`${this.baseURL}${num}/${year}`);
  }

  unenrolStudent(enrol: EnrolsModel): Observable<EnrolsModel> {
    return this.httpClient.delete<EnrolsModel>(this.baseURL + enrol.id);
  }

  migrateClass(
    fromName: string,
    fromNum: number,
    fromYear: number,
    toName: string,
    toNum: number,
    toYear: number
  ): Observable<boolean> {
    return this.httpClient.get<boolean>(
      `${this.baseURL}migrate/${fromName}/${fromNum}/${fromYear}/${toName}/${toNum}/${toYear}`
    );
  }
}
