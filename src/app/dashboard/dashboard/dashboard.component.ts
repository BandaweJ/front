import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { selectErrorMsg } from 'src/app/auth/store/auth.selectors';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import {
  fetchClasses,
  fetchTerms,
  fetchTotalEnrols,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
  selectTotalEnroment,
} from 'src/app/enrolment/store/enrolment.selectors';
import { SubjectsModel } from 'src/app/marks/models/subjects.model';
import { fetchSubjects } from 'src/app/marks/store/marks.actions';
import { selectSubjects } from 'src/app/marks/store/marks.selectors';
import { Residence } from 'src/app/registration/models/residence.enum';
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
  authErrMsg$ = this.store.select(selectErrorMsg);

  teachers$ = this.store.select(selectTeachers);

  students$ = this.store.select(selectStudents);
  classes$ = this.store.select(selectClasses);
  subjects$ = this.store.select(selectSubjects);
  enrolsSummary$ = this.store.select(selectTotalEnroment);

  currentTermNum!: number;
  currentTermYear!: number;

  maleTeachers!: number;
  femaleTeachers!: number;

  dayScholars!: number;
  boarders!: number;

  today = new Date();

  constructor(
    private store: Store,
    private title: Title,
    private router: Router
  ) {
    this.store.dispatch(fetchTeachers());
    this.store.dispatch(fetchStudents());
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchSubjects());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.teachers$
      .pipe(
        tap((arr) => {
          this.maleTeachers = arr.filter((tr) => tr.gender === 'Male').length;
          this.femaleTeachers = arr.filter(
            (tr) => tr.gender === 'Female'
          ).length;
        })
      )
      .subscribe();
    // this.enrolsSummary$.subscribe((summary) => console.log(summary));
    // this.enrols$
    //   .pipe(
    //     tap((arr) => {
    //       this.dayScholars = arr.filter(
    //         (st) => st.residence === Residence.Day
    //       ).length;
    //       this.boarders = arr.filter(
    //         (st) => st.residence === Residence.Boarder
    //       ).length;
    //       this.girls = arr.filter((st) => st.gender === 'Female').length;
    //       this.boys = arr.filter((st) => st.gender === 'Male').length;
    //     })
    //   )
    //   .subscribe();
    // console.log('boarder: ', this.boarders, 'day scholars: ', this.dayScholars);

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
              this.store.dispatch(fetchTotalEnrols({ num, year }));

              // console.log('Found it : ', term);
            }
          })
        )
      )
      .subscribe();
  }

  navigateToTeachersSummary() {
    this.router.navigate(['/teachers']);
  }
}
