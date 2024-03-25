import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SubjectsModel } from '../models/subjects.model';
import { MarksModel } from '../models/marks.model';
import { StudentComment } from '../models/student-comment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarksService {
  baseUrl = environment.apiUrl + 'marks/';

  constructor(private httpClient: HttpClient) {}

  getAllSubjects(): Observable<SubjectsModel[]> {
    return this.httpClient.get<SubjectsModel[]>(this.baseUrl + 'subjects');
  }

  addSubject(subject: SubjectsModel): Observable<SubjectsModel> {
    return this.httpClient.post<SubjectsModel>(
      this.baseUrl + 'subjects',
      subject
    );
  }

  editSubject(subject: SubjectsModel): Observable<SubjectsModel> {
    return this.httpClient.patch<SubjectsModel>(
      this.baseUrl + 'subjects',
      subject
    );
  }

  deleteSubject(subject: SubjectsModel): Observable<{ code: string }> {
    return this.httpClient.delete<{ code: string }>(
      this.baseUrl + `subjects/${subject.code}`
    );
  }

  getMarksInClassBySubject(
    name: string,
    num: number,
    year: number,
    subjectCode: string
  ): Observable<MarksModel[]> {
    return this.httpClient.get<MarksModel[]>(
      `${this.baseUrl}marks/${num}/${year}/${name}/${subjectCode}`
    );
  }

  saveMark(mark: MarksModel): Observable<MarksModel> {
    return this.httpClient.post<MarksModel>(this.baseUrl + 'marks/', mark);
  }

  deleteMark(mark: MarksModel): Observable<MarksModel> {
    // console.log(mark);
    return this.httpClient.delete<MarksModel>(
      this.baseUrl + 'marks/' + mark.id
    );
  }

  saveComment(comment: StudentComment): Observable<StudentComment> {
    // console.log(comment);
    return this.httpClient.post<StudentComment>(
      this.baseUrl + 'comments/',
      comment
    );
  }

  fetchClassComments(
    name: string,
    num: number,
    year: number
  ): Observable<StudentComment[]> {
    return this.httpClient.get<StudentComment[]>(
      `${this.baseUrl}comments/${name}/${num}/${year}`
    );
  }

  getPerfomanceData(
    num: number,
    year: number,
    name: string
  ): Observable<{
    subjects: SubjectsModel[];
    subjectsMarks: Array<MarksModel[]>;
    marks: Array<number[]>;
    xAxes: number[];
  }> {
    return this.httpClient.get<{
      subjects: SubjectsModel[];
      subjectsMarks: Array<MarksModel[]>;
      marks: Array<number[]>;
      xAxes: number[];
    }>(`${this.baseUrl}perf/${num}/${year}/${name}`);
  }
}
