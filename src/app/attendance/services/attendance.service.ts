import { Injectable } from '@angular/core';
import { RegisterModel } from '../models/register.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private httpClient: HttpClient) {}

  baseURL = `${environment.apiUrl}enrolment/enrol/`;

  markRegister(
    enrol: RegisterModel,
    present: boolean
  ): Observable<RegisterModel> {
    const enro = { ...enrol };

    enro.present = present;

    console.log(enro);

    return this.httpClient.post<RegisterModel>(this.baseURL + 'register', enro);
  }

  getTodayRegisterByClass(
    name: string,
    num: number,
    year: number
  ): Observable<RegisterModel[]> {
    return this.httpClient.get<RegisterModel[]>(
      `${this.baseURL}register/${name}/${num}/${year}`
    );
  }
}
