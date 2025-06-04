import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  Observable,
  Subject,
  combineLatest,
  filter,
  map,
  tap,
  takeUntil,
} from 'rxjs'; // Added Subject, combineLatest, filter, map, takeUntil
import { selectErrorMsg, selectUser } from 'src/app/auth/store/auth.selectors';
import {
  fetchClasses,
  fetchTerms,
  fetchTotalEnrols,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectCurrentTerm,
  selectTerms,
  selectTotalEnroment,
} from 'src/app/enrolment/store/enrolment.selectors';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
import { selectedStudentInvoice } from 'src/app/finance/store/finance.selector';
import { fetchSubjects } from 'src/app/marks/store/marks.actions';
import { selectSubjects } from 'src/app/marks/store/marks.selectors';
import { ROLES } from 'src/app/registration/models/roles.enum';
import {
  fetchStudents,
  fetchTeachers,
} from 'src/app/registration/store/registration.actions';
import {
  selectStudents,
  selectTeachers,
} from 'src/app/registration/store/registration.selectors';
import { currentTermActions } from '../../enrolment/store/enrolment.actions';
import { ReportsModel } from 'src/app/reports/models/reports.model';
import { viewReportsActions } from 'src/app/reports/store/reports.actions';
import { selectStudentReports } from 'src/app/reports/store/reports.selectors';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // Used for unsubscribing from observables

  teachers$ = this.store.select(selectTeachers);
  invoice$ = this.store.select(selectedStudentInvoice);
  studentReports$ = this.store.select(selectStudentReports);
  students$ = this.store.select(selectStudents);
  classes$ = this.store.select(selectClasses);
  subjects$ = this.store.select(selectSubjects);
  enrolsSummary$ = this.store.select(selectTotalEnroment);
  selectedReport: ReportsModel | null = null;
  user$ = this.store.select(selectUser);

  currentTerm$ = this.store.select(selectCurrentTerm);

  role!: ROLES; // Role is now directly used, but could be an observable if needed
  id: string = '';

  currentTermNum!: number;
  currentTermYear!: number;
  invoice!: InvoiceModel;

  maleTeachers!: number;
  femaleTeachers!: number;

  dayScholars!: number; // These are calculated from enrolsSummary$, so consider deriving them reactively
  boarders!: number; // These are calculated from enrolsSummary$, so consider deriving them reactively

  today = new Date();

  constructor(
    private store: Store,
    private title: Title,
    private router: Router
  ) {
    // Initial dispatches based on user role when user data is available
    this.user$
      .pipe(
        filter((user) => !!user), // Ensure user is not null/undefined
        tap((user) => {
          this.role = user!.role; // Assign role here
          this.id = user!.id; // Assign ID here

          // Dispatch actions for admin/hod/reception/teacher roles
          if (
            [ROLES.admin, ROLES.hod, ROLES.reception, ROLES.teacher].includes(
              user!.role
            )
          ) {
            this.store.dispatch(fetchTeachers());
            this.store.dispatch(fetchStudents());
            this.store.dispatch(fetchClasses());
            this.store.dispatch(fetchSubjects());
          }

          // Dispatch actions specific to student role
          if (user!.role === ROLES.student) {
            this.store.dispatch(
              viewReportsActions.fetchStudentReports({ studentNumber: this.id })
            );
            // Invoice fetch for student is dependent on currentTermYear/Num,
            // so it's handled below in the combineLatest
          }
        }),
        takeUntil(this.destroy$) // Unsubscribe when component is destroyed
      )
      .subscribe();

    // Always fetch terms regardless of role
    this.store.dispatch(fetchTerms());
    this.store.dispatch(currentTermActions.fetchCurrentTerm());
  }

  ngOnInit(): void {
    // Calculate male/female teachers reactively
    this.teachers$
      .pipe(
        tap((arr) => {
          this.maleTeachers = arr.filter((tr) => tr.gender === 'Male').length;
          this.femaleTeachers = arr.filter(
            (tr) => tr.gender === 'Female'
          ).length;
        }),
        takeUntil(this.destroy$) // Unsubscribe
      )
      .subscribe();

    // Assign invoice if available
    this.invoice$
      .pipe(
        tap((inv) => {
          if (inv) {
            this.invoice = inv;
          }
        }),
        takeUntil(this.destroy$) // Unsubscribe
      )
      .subscribe();

    // Determine current term and dispatch total enrols/student invoice
    // dashboard.component.ts (within ngOnInit)
    combineLatest([this.user$, this.currentTerm$]) // Assuming currentTerm$ is implemented now for backend call
      .pipe(
        filter(([user, term]) => {
          // Ensure user exists, term exists, AND term.num AND term.year are valid numbers.
          // This is the crucial change to prevent the initial undefined dispatch.
          const isValid =
            !!user &&
            !!term &&
            typeof term.num === 'number' && // <-- ADD THIS CHECK
            typeof term.year === 'number'; // <-- ADD THIS CHECK

          return isValid;
        }),
        tap(([user, term]) => {
          // At this point, we are GUARANTEED that user, term, term.num, and term.year are defined and correct
          this.currentTermNum = term.num; // No need for ! as it's guaranteed by the filter
          this.currentTermYear = term.year; // No need for ! as it's guaranteed by the filter

          const num = this.currentTermNum;
          const year = this.currentTermYear;
          this.store.dispatch(fetchTotalEnrols({ num, year }));

          // Also dispatch other actions that depend on valid term data, if applicable
          if (user?.role === ROLES.student) {
            // Use string literal or constant for role if it's not ROLES.student
            this.store.dispatch(
              invoiceActions.fetchInvoice({
                studentNumber: user.id,
                year: year,
                num: num,
              })
            );
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  // Centralized navigation method for role-based access
  private _navigateToRoleBased(path: string): void {
    if (
      [ROLES.admin, ROLES.hod, ROLES.reception, ROLES.teacher].includes(
        this.role
      )
    ) {
      this.router.navigate([path]);
    }
  }

  navigateToTeachersSummary(): void {
    this._navigateToRoleBased('/teachers');
  }

  navigateToStudentsSummary(): void {
    this._navigateToRoleBased('/students');
  }

  navigateToClassLists(): void {
    this._navigateToRoleBased('/class-lists');
  }

  changeSelectedReport(report: ReportsModel): void {
    this.selectedReport = report;
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to complete all subscriptions
    this.destroy$.complete(); // Complete the subject
  }
}
