import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParentsModel } from '../models/parents.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ParentsService {
  private baseUrl = `${environment.apiUrl}/parents/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ParentsModel[]> {
    return this.http.get<ParentsModel[]>(this.baseUrl);
  }

  getByEmail(email: string): Observable<ParentsModel> {
    return this.http.get<ParentsModel>(this.baseUrl + encodeURIComponent(email));
  }

  create(parent: ParentsModel): Observable<ParentsModel> {
    return this.http.post<ParentsModel>(this.baseUrl, parent);
  }

  update(email: string, parent: Partial<ParentsModel>): Observable<ParentsModel> {
    return this.http.patch<ParentsModel>(
      this.baseUrl + encodeURIComponent(email),
      parent,
    );
  }

  delete(email: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl + encodeURIComponent(email));
  }

  setLinkedStudents(
    parentEmail: string,
    studentNumbers: string[],
  ): Observable<ParentsModel> {
    return this.http.put<ParentsModel>(
      `${this.baseUrl}${encodeURIComponent(parentEmail)}/students`,
      { studentNumbers },
    );
  }
}
