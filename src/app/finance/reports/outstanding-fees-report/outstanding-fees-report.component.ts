import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import {
  startWith,
  map,
  tap,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

// Import Ngrx actions for data loading
import { invoiceActions } from '../../store/finance.actions';
import { fetchStudents } from 'src/app/registration/store/registration.actions';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';

// Import selectors and report models
import {
  selectIsLoadingFinancials,
  selectErrorMsg,
  getOutstandingFeesReport,
} from '../../store/finance.selector';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';

import {
  OutstandingFeesReportFilters,
  OutstandingEnrolmentSummary,
  OutstandingResidenceSummary,
  OutstandingStudentDetail,
  OutstandingFeesReportData,
} from '../../models/outstanding-fees.model';

import { ClassesModel } from '../../../enrolment/models/classes.model';
import { TermsModel } from '../../../enrolment/models/terms.model';

// Import for pagination
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-outstanding-fees-report',
  templateUrl: './outstanding-fees-report.component.html',
  styleUrls: ['./outstanding-fees-report.component.css'],
})
export class OutstandingFeesReportComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<any>;
  terms$: Observable<TermsModel[]>;
  allClasses$: Observable<ClassesModel[]>;

  private filters$$ = new BehaviorSubject<OutstandingFeesReportFilters>({});
  reportData$!: Observable<OutstandingFeesReportData>;

  enrolmentSummaryTableData: OutstandingEnrolmentSummary[] = [];
  residenceSummaryTableData: OutstandingResidenceSummary[] = [];
  studentDetailsTableData: OutstandingStudentDetail[] = []; // This will hold the FULL filtered list

  // --- Pagination Properties ---
  pageSize = 10; // Default number of items per page
  pageIndex = 0; // Current page index (0-based)
  pageSizeOptions: number[] = [5, 10, 25, 50, 100]; // Options for "items per page" dropdown
  totalStudents = 0; // Total count of students after filters are applied (before pagination)

  // This will hold the subset of students for the current page
  paginatedStudentDetails: OutstandingStudentDetail[] = [];

  // Flag to control which dataSource is used for the student details table
  isPrinting: boolean = false;

  enrolmentSummaryDisplayedColumns: string[] = [
    'enrolName',
    'totalOutstanding',
  ];
  residenceSummaryDisplayedColumns: string[] = [
    'residence',
    'totalOutstanding',
  ];
  studentDetailsDisplayedColumns: string[] = [
    'studentName',
    'enrolName',
    'residence',
    'totalOutstanding',
  ];

  private formChangesSubscription: Subscription | undefined;

  constructor(private store: Store, private snackBar: MatSnackBar) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.error$ = this.store.select(selectErrorMsg);
    this.terms$ = this.store.select(selectTerms);
    this.allClasses$ = this.store.select(selectClasses);
  }

  ngOnInit(): void {
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(fetchStudents());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());

    this.filterForm = new FormGroup({
      classFilter: new FormControl<ClassesModel | null>(null),
      residenceFilter: new FormControl<string | null>(null),
      termFilter: new FormControl<TermsModel | null>(null),
      searchQuery: new FormControl<string | null>(null),
    });

    this.reportData$ = this.filters$$.pipe(
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      ),
      switchMap((filters) =>
        this.store.select(getOutstandingFeesReport(filters))
      ),
      tap((data) => {
        if (data) {
          this.enrolmentSummaryTableData =
            this.transformEnrolmentSummaryMapToArray(data.summaryByEnrolment);
          this.residenceSummaryTableData =
            this.transformResidenceSummaryMapToArray(data.summaryByResidence);

          this.studentDetailsTableData = data.studentDetails; // Store the full filtered list
          this.totalStudents = data.studentDetails.length; // Update total count
          this.applyPagination(); // Apply pagination to get the current page's data
        }
      })
    );

    this.formChangesSubscription = combineLatest([
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.value),
        debounceTime(300), // Debounce to prevent excessive updates while typing
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      ),
      this.store.select(selectTerms).pipe(
        tap((terms) => {
          if (!terms || terms.length === 0) {
            console.warn('Terms not yet loaded or empty.');
          }
        })
      ),
    ])
      .pipe(
        map(([formValue, terms]) => {
          let termId: string | null = null;

          if (formValue.termFilter) {
            termId = `${formValue.termFilter.num}-${formValue.termFilter.year}`;
          }

          return {
            enrolmentName: formValue.classFilter?.name || null,
            residence: formValue.residenceFilter || null,
            termId: termId,
            searchQuery: formValue.searchQuery || null,
          } as OutstandingFeesReportFilters;
        })
      )
      .subscribe((filters) => {
        this.pageIndex = 0; // Reset pageIndex when any filter (including search) changes
        this.filters$$.next(filters);
        console.log('Outstanding Fees Filters updated and pushed:', filters);
      });

    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }

  ngOnDestroy(): void {
    this.formChangesSubscription?.unsubscribe();
    this.filters$$.complete();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      classFilter: null,
      residenceFilter: null,
      termFilter: null,
      searchQuery: null,
    });
  }

  // --- Pagination Methods ---
  applyPagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedStudentDetails = this.studentDetailsTableData.slice(
      startIndex,
      endIndex
    );
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.applyPagination();
  }
  // --- End Pagination Methods ---

  private transformEnrolmentSummaryMapToArray(
    map: Map<string, number>
  ): OutstandingEnrolmentSummary[] {
    return Array.from(map.entries()).map(([enrolName, totalOutstanding]) => ({
      enrolName: enrolName,
      totalOutstanding: totalOutstanding,
    }));
  }

  private transformResidenceSummaryMapToArray(
    map: Map<string, number>
  ): OutstandingResidenceSummary[] {
    return Array.from(map.entries()).map(([residence, totalOutstanding]) => ({
      residence: residence,
      totalOutstanding: totalOutstanding,
    }));
  }

  // --- Print Functionality ---
  printReport(): void {
    this.isPrinting = true; // Set flag to use full data source

    // A small timeout to allow Angular to re-render the table with all rows
    setTimeout(() => {
      window.print();
      this.isPrinting = false; // Revert flag after print dialog is initiated
    }, 1000); // Small delay
  }
}
