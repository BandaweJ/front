// src/app/finance/components/enrollment-billing-reconciliation-report/enrollment-billing-reconciliation-report.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import {
  startWith,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  filter,
  take,
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

// Ngrx actions and selectors

import * as enrolmentActions from 'src/app/enrolment/store/enrolment.actions'; // Alias for fetchEnrols / fetchTermEnrols
import {
  selectTerms,
  selectClasses,
} from 'src/app/enrolment/store/enrolment.selectors';
import {
  selectIsLoadingFinancials,
  getEnrollmentBillingReconciliationReport,
} from '../../store/finance.selector';

// Report model
import {
  EnrollmentBillingReportData,
  EnrollmentBillingReportFilters,
} from '../../models/enrollment-billing-reconciliation-report.model';

import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';

@Component({
  selector: 'app-enrollment-billing-reconciliation-report',
  templateUrl: './enrollment-billing-reconciliation-report.component.html',
  styleUrls: ['./enrollment-billing-reconciliation-report.component.css'],
})
export class EnrollmentBillingReconciliationReportComponent
  implements OnInit, OnDestroy
{
  filterForm: FormGroup;
  isLoading$: Observable<boolean>;
  terms$: Observable<TermsModel[]>;
  classes$: Observable<ClassesModel[]>;
  reportData$: Observable<EnrollmentBillingReportData | null>;
  formChangesSubscription: Subscription | undefined;

  displayedColumns: string[] = [
    'studentNumber',
    'studentName',
    'className',
    'enrolledStatus',
    'invoicedStatus',
    'invoiceNumber',
    'balance',
    'discrepancyMessage',
  ];

  constructor(private store: Store, private snackBar: MatSnackBar) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.terms$ = this.store.select(selectTerms);
    this.classes$ = this.store.select(selectClasses);

    this.filterForm = new FormGroup({
      termFilter: new FormControl<TermsModel | null>(null),
      classFilter: new FormControl<ClassesModel | null>(null),
    });

    // Initialize reportData$ with a default empty state
    this.reportData$ = this.store.select(
      getEnrollmentBillingReconciliationReport({ termId: '', classId: null })
    );
  }

  ngOnInit(): void {
    // 1. Dispatch actions to load general data that doesn't depend on filter selections
    // Assuming these are loaded globally and don't need to be re-fetched:
    // this.store.dispatch(fetchTerms());
    // this.store.dispatch(fetchClasses());
    // this.store.dispatch(fetchInvoices());
    // this.store.dispatch(studentsActions.fetchStudents());

    // 2. Subscribe to terms to set a default term, then trigger report generation
    this.terms$
      .pipe(
        filter((terms) => terms && terms.length > 0),
        take(1)
      )
      .subscribe((terms) => {
        if (!this.filterForm.get('termFilter')?.value) {
          const mostRecentTerm = terms.reduce((prev, current) => {
            if (!prev) return current;
            const prevDate = new Date(prev.startDate || '');
            const currDate = new Date(current.startDate || '');
            return currDate > prevDate ? current : prev;
          }, terms[0]);
          this.filterForm
            .get('termFilter')
            ?.setValue(mostRecentTerm, { emitEvent: false });
        }
        this.filterForm.updateValueAndValidity({ emitEvent: true }); // Trigger pipeline
      });

    // 3. Subscribe to filter form changes to trigger data fetching and report generation
    this.formChangesSubscription = this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        tap((formValue) => {
          // Dispatch fetchTermEnrols *every* time the term changes
          if (
            formValue.termFilter &&
            formValue.termFilter.num &&
            formValue.termFilter.year
          ) {
            this.store.dispatch(
              enrolmentActions.termEnrolsActions.fetchTermEnrols({
                // Use the correct action
                num: formValue.termFilter.num,
                year: formValue.termFilter.year,
              })
            );
          }
        }),
        map((formValue) => {
          if (
            !formValue.termFilter ||
            !formValue.termFilter.num ||
            !formValue.termFilter.year
          ) {
            this.snackBar.open(
              'Please select a term to generate the report.',
              'Dismiss',
              { duration: 3000 }
            );
            return null;
          }
          const termId = `${formValue.termFilter.num}-${formValue.termFilter.year}`;
          return {
            termId: termId,
            classId: formValue.classFilter?.id || null,
          } as EnrollmentBillingReportFilters;
        }),
        switchMap((filters) => {
          if (!filters) {
            return new Observable<EnrollmentBillingReportData | null>(
              (observer) => observer.next(null)
            );
          }
          return this.store.select(
            getEnrollmentBillingReconciliationReport(filters)
          );
        }),
        tap((report) => {
          if (!report || report.details.length === 0) {
            console.log(
              'No Enrollment vs. Billing Reconciliation Report data found for the selected criteria.'
            );
          } else {
            console.log(
              'Enrollment vs. Billing Reconciliation Report data loaded:',
              report
            );
          }
        })
      )
      .subscribe((reportData) => {
        this.reportData$ = new Observable<EnrollmentBillingReportData | null>(
          (observer) => observer.next(reportData)
        );
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.formChangesSubscription?.unsubscribe();
  }

  onClearFilters(): void {
    // Reset the form controls, which will trigger the valueChanges pipeline
    this.filterForm.reset({
      termFilter: null,
      classFilter: null,
    });
  }
}
