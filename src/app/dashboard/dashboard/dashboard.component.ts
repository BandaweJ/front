import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { selectErrorMsg, selectUser } from 'src/app/auth/store/auth.selectors';
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
import { ROLES } from 'src/app/registration/models/roles.enum';
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
  user$ = this.store.select(selectUser);
  role!: ROLES;
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
    this.user$.subscribe((user) => {
      switch (user?.role) {
        case ROLES.admin:
        case ROLES.hod:
        case ROLES.reception:
        case ROLES.teacher: {
          this.store.dispatch(fetchTeachers());
          this.store.dispatch(fetchStudents());
          this.store.dispatch(fetchClasses());
          this.store.dispatch(fetchSubjects());
        }
      }
    });
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
    this.user$.subscribe((usr) => {
      if (usr?.role) {
        this.role = usr.role;
        console.log('User is a : ', this.role);
      }
    });
  }

  navigateToTeachersSummary() {
    switch (this.role) {
      case ROLES.admin:
      case ROLES.hod:
      case ROLES.reception:
      case ROLES.teacher: {
        this.router.navigate(['/teachers']);
      }
    }
  }

  navigateToStudentsSummary() {
    switch (this.role) {
      case ROLES.admin:
      case ROLES.hod:
      case ROLES.reception:
      case ROLES.teacher: {
        this.router.navigate(['/students']);
      }
    }
  }

  navigateToClassLists() {
    switch (this.role) {
      case ROLES.admin:
      case ROLES.hod:
      case ROLES.reception:
      case ROLES.teacher: {
        this.router.navigate(['/class-lists']);
      }
    }
  }
}
