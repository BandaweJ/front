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
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
import { selectedStudentInvoice } from 'src/app/finance/store/finance.selector';
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
import { ReportModel } from 'src/app/reports/models/report.model';
import { ReportsModel } from 'src/app/reports/models/reports.model';
import { viewReportsActions } from 'src/app/reports/store/reports.actions';
import { selectStudentReports } from 'src/app/reports/store/reports.selectors';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  authErrMsg$ = this.store.select(selectErrorMsg);

  teachers$ = this.store.select(selectTeachers);
  invoice$ = this.store.select(selectedStudentInvoice);

  studentReports$ = this.store.select(selectStudentReports);

  students$ = this.store.select(selectStudents);
  classes$ = this.store.select(selectClasses);
  subjects$ = this.store.select(selectSubjects);
  enrolsSummary$ = this.store.select(selectTotalEnroment);
  selectedReport: ReportsModel | null = null;
  user$ = this.store.select(selectUser);
  role!: ROLES;
  id: string = '';
  currentTermNum!: number;
  currentTermYear!: number;
  invoice!: InvoiceModel;

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

    this.invoice$.subscribe((inv) => {
      if (inv) {
        this.invoice = inv;
      }
    });

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
    this.user$.subscribe((user) => {
      if (user) {
        this.role = user.role;
        this.id = user.id;
      }
    });

    if (this.role === ROLES.student) {
      this.store.dispatch(
        viewReportsActions.fetchStudentReports({ studentNumber: this.id })
      );
      const studentNumber = this.id;
      this.store.dispatch(invoiceActions.fetchInvoice({ studentNumber }));
    }
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

  changeSelectedReport(report: ReportsModel) {
    this.selectedReport = report;
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
