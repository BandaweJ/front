// src/app/finance/components/aged-debtors-report/aged-debtors-report.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import {
  startWith,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

// Ngrx actions for data loading
import { invoiceActions } from '../../store/finance.actions'; // Assuming this action group exists
import {
  fetchTerms,
  fetchClasses,
} from 'src/app/enrolment/store/enrolment.actions'; // Assuming these actions exist
import { fetchStudents } from 'src/app/registration/store/registration.actions'; // Assuming this action exists

// Ngrx selectors
import {
  selectIsLoadingFinancials,
  selectAllInvoices,
} from '../../store/finance.selector'; // Make sure selectAllInvoices is available
import {
  selectTerms,
  selectClasses,
} from 'src/app/enrolment/store/enrolment.selectors'; // Make sure these selectors exist
import { selectStudents } from 'src/app/registration/store/registration.selectors'; // Make sure this selector exists

// Report models
import {
  AgedDebtorsReportData,
  AgedDebtorsReportFilters,
  AgedInvoiceSummary,
} from '../../models/aged-debtors-report.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { StudentsModel } from 'src/app/registration/models/students.model';

// You will create this selector in the next step
import { getAgedDebtorsReport } from '../../store/finance.selector';

@Component({
  selector: 'app-aged-debtors-report',
  templateUrl: './aged-debtors-report.component.html',
  styleUrls: ['./aged-debtors-report.component.css'],
})
export class AgedDebtorsReportComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  isLoading$: Observable<boolean>;
  terms$: Observable<TermsModel[]>;
  classes$: Observable<ClassesModel[]>;
  students$: Observable<StudentsModel[]>; // For student filter/drill-down
  reportData$!: Observable<AgedDebtorsReportData | null>;

  // Columns for the detailed invoices table
  displayedColumns: string[] = [
    'invoiceNumber',
    'studentName',
    'studentNumber', // Added studentNumber to display
    'className',
    'termName',
    'invoiceDate',
    'dueDate',
    'currentBalance',
    'daysOverdue',
    'statusBucket',
  ];

  // BehaviorSubject to hold the current filters, allowing the selector to react to changes
  private filters$$ = new BehaviorSubject<AgedDebtorsReportFilters>({
    asOfDate: new Date(), // Default to today's date
    termId: null,
    enrolmentName: null,
    studentNumber: null, // Changed from studentId to studentNumber
  });
  private formChangesSubscription: Subscription | undefined;

  constructor(private store: Store, private snackBar: MatSnackBar) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials); // Assuming a loading selector for financial data
    this.terms$ = this.store.select(selectTerms);
    this.classes$ = this.store.select(selectClasses);
    this.students$ = this.store.select(selectStudents); // Assuming this selector exists for students
  }

  ngOnInit(): void {
    // Dispatch actions to load all necessary data for filters and reports
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchStudents()); // Fetch students for the student filter

    // Initialize the filter form
    this.filterForm = new FormGroup({
      asOfDate: new FormControl<Date>(new Date()),
      termFilter: new FormControl<TermsModel | null>(null),
      classFilter: new FormControl<ClassesModel | null>(null),
      studentFilter: new FormControl<StudentsModel | null>(null), // This control still holds the full StudentsModel
    });

    // Subscribe to form value changes to update filters and trigger report regeneration
    this.formChangesSubscription = this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value), // Emit initial form value on component load
        debounceTime(300), // Wait for user to finish typing/selecting
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ), // Only emit if actual filter values change
        map((formValue) => {
          let termId: string | null = null;
          // Convert term object to termId string (e.g., "1-2024") for the filter
          if (formValue.termFilter) {
            termId = `${formValue.termFilter.num}-${formValue.termFilter.year}`;
          }
          return {
            asOfDate: formValue.asOfDate || new Date(), // Ensure a date is always present
            termId: termId,
            enrolmentName: formValue.classFilter?.name || null, // Extract class name for filtering (from ClassesModel.name, maps to EnrolsModel.name)
            studentNumber: formValue.studentFilter?.studentNumber || null, // Extract studentNumber for filtering (from StudentsModel.studentNumber)
          } as AgedDebtorsReportFilters;
        })
      )
      .subscribe((filters) => {
        this.filters$$.next(filters); // Push the new filters to the BehaviorSubject
        console.log('Aged Debtors Report Filters updated:', filters);
      });

    // Combine filters with the Ngrx store selector to get the report data
    this.reportData$ = combineLatest([
      this.filters$$, // Listen for changes in the filters
    ]).pipe(
      switchMap(([filters]) => {
        // When filters change, use switchMap to call the selector with the new filters
        return this.store.select(getAgedDebtorsReport(filters));
      }),
      tap((report) => {
        if (!report && this.filters$$.value.termId) {
          console.warn(
            'Aged Debtors Report data not yet available for the selected term or criteria.'
          );
        }
      })
    );

    // Trigger initial filter update to load data for default values
    // This ensures the report is generated when the component first loads.
    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }

  ngOnDestroy(): void {
    this.formChangesSubscription?.unsubscribe(); // Unsubscribe to prevent memory leaks
    this.filters$$.complete(); // Complete the BehaviorSubject
  }

  // Resets the filter form to its initial state
  onClearFilters(): void {
    this.filterForm.reset({
      asOfDate: new Date(),
      termFilter: null,
      classFilter: null,
      studentFilter: null,
    });
  }
}
