import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, filter, map, take, tap } from 'rxjs';
import { fetchAccountStats } from 'src/app/auth/store/auth.actions';
import { selectErrorMsg } from 'src/app/auth/store/auth.selectors';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchEnrols,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
  selectTotalEnroment,
} from 'src/app/enrolment/store/enrolment.selectors';
import { SubjectsModel } from 'src/app/marks/models/subjects.model';
import { fetchSubjects } from 'src/app/marks/store/marks.actions';
import { selectSubjects } from 'src/app/marks/store/marks.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';
import {
  fetchStudents,
  fetchTeachers,
} from 'src/app/registration/store/registration.actions';
import {
  selectStudents,
  selectTeachers,
} from 'src/app/registration/store/registration.selectors';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  authErrMsg$!: Observable<string>;

  teachers$!: Observable<TeachersModel[]>;

  students$!: Observable<StudentsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  subjects$!: Observable<SubjectsModel[]>;
  enrols$!: Observable<EnrolsModel[]>;

  currentTermNum!: number;
  currentTermYear!: number;

  maleTeachers!: number;
  femaleTeachers!: number;

  dayScholars!: number;
  boarders!: number;

  today = new Date();

  constructor(private store: Store, private title: Title) {
    this.store.dispatch(fetchTeachers());
    this.store.dispatch(fetchStudents());
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchSubjects());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.teachers$ = this.store.select(selectTeachers).pipe(
      tap((arr) => {
        this.maleTeachers = arr.filter((tr) => tr.gender === 'Male').length;
        this.femaleTeachers = arr.filter((tr) => tr.gender === 'Female').length;
      })
    );
    this.students$ = this.store.select(selectStudents).pipe(
      tap((arr) => {
        this.dayScholars = arr.filter((st) => st.residence === 'Day').length;
        this.boarders = arr.filter((st) => st.residence === 'Boarder').length;
      })
    );
    this.classes$ = this.store.select(selectClasses);
    this.subjects$ = this.store.select(selectSubjects);
    this.authErrMsg$ = this.store.select(selectErrorMsg);
    this.enrols$ = this.store.select(selectTotalEnroment);

    // this.store.select(selectTerms).subscribe((terms) =>
    //   terms.map((term) => {
    //     console.log(terms);
    //   })
    // );

    this.store
      .select(selectTerms)
      .pipe(
        tap((terms) =>
          terms.map((term) => {
            // console.log('Terms :', terms);
            if (
              new Date(term.startDate) < this.today &&
              new Date(term.endDate) > this.today
            ) {
              this.currentTermNum = term.num;
              this.currentTermYear = term.year;

              const num = this.currentTermNum;
              const year = this.currentTermYear;
              this.store.dispatch(fetchEnrols({ num, year }));

              // console.log('Found it : ', term);
            }
          })
        )
      )
      .subscribe();
  }
}
