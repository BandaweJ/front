import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, tap, switchMap, map, take } from 'rxjs/operators';

import * as ReportsActions from '../store/reports.actions';
import * as AuthSelectors from 'src/app/auth/store/auth.selectors';
import {
  selectHasLinkedChildrenProfile,
  selectLinkedChildrenAnyRole,
} from 'src/app/auth/store/auth.selectors';
import { ReportsModel } from '../models/reports.model';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { Router } from '@angular/router';

// --- NEW IMPORTS FOR INVOICE MODELS AND SELECTORS/ACTIONS ---
import { InvoiceModel } from 'src/app/finance/models/invoice.model'; // Adjust path
import {
  selectLoadingStudentInvoices,
  selectStudentInvoices,
} from 'src/app/finance/store/finance.selector';
import {
  selectIsLoading,
  selectReportsErrorMsg,
  selectReportsLoaded,
  selectSelectedReport,
  selectStudentReports,
} from '../store/reports.selectors';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
// Import the *actual* selectors provided by the user

@Component({
  selector: 'app-student-report-cards',
  templateUrl: './student-report-cards.component.html',
  styleUrls: ['./student-report-cards.component.css'],
})
export class StudentReportCardsComponent implements OnInit, OnDestroy {
  studentReports$: Observable<ReportsModel[]>;
  selectedReport$: Observable<ReportsModel | null>;
  isLoading$: Observable<boolean>;
  errorMessage$: Observable<string>;

  // --- NEW Observables for Invoices (using provided selector names) ---
  allInvoices$: Observable<InvoiceModel[]>; // This will now map to selectStudentInvoices
  invoicesLoading$: Observable<boolean>; // This will now map to selectLoadingStudentInvoices
  // No direct 'invoicesLoaded$' selector was provided, so we'll rely on invoicesLoading$ and the presence of data.
  // For better state management, consider adding `loaded: boolean;` to your finance state and a corresponding selector.
  // For now, `invoicesLoaded$` will be derived implicitly for `filter` logic.
  // --- END NEW Observables ---

  studentNumber: string | null = null;
  isParent$: Observable<boolean>;
  linkedChildren$: Observable<{ studentNumber: string; name?: string; surname?: string }[]>;
  /** When user is parent: selected child's student number. */
  selectedChildStudentNumber$ = new BehaviorSubject<string | null>(null);
  /** Effective student number for fetching reports: user.id for student, selected child for parent. */
  effectiveStudentNumber$: Observable<string | null>;
  private destroy$ = new Subject<void>();

  availableTerms: number[] = [];
  availableYears: number[] = [];
  availableExamTypes: ExamType[] = [...Object.values(ExamType)];

  selectedTerm: number | null = null;
  selectedYear: number | null = null;
  selectedExamType: ExamType | null = null;

  constructor(private store: Store, private router: Router) {
    this.studentReports$ = this.store.select(selectStudentReports);
    this.selectedReport$ = this.store.select(selectSelectedReport);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.errorMessage$ = this.store.select(selectReportsErrorMsg);

    // --- Initialize NEW Invoices Observables (using provided selector names) ---
    this.allInvoices$ = this.store.select(selectStudentInvoices); // Use the provided selector
    this.invoicesLoading$ = this.store.select(selectLoadingStudentInvoices); // Use the provided selector
    // --- END Initialize NEW Observables ---

    // Treat any account with linked children as "parent-like" for this view
    this.isParent$ = this.store.select(selectHasLinkedChildrenProfile);
    this.linkedChildren$ = this.store.select(selectLinkedChildrenAnyRole);
    this.effectiveStudentNumber$ = combineLatest([
      this.store.select(AuthSelectors.selectUser),
      this.isParent$,
      this.linkedChildren$,
      this.selectedChildStudentNumber$,
    ]).pipe(
      map(([user, isParent, children, selected]) => {
        if (!user?.id) return null;
        if (!isParent) return user.id;
        if (!children?.length) return null;
        return selected || children[0]?.studentNumber || null;
      })
    );
  }

  onParentSelectChild(studentNumber: string): void {
    this.selectedChildStudentNumber$.next(studentNumber);
  }

  ngOnInit(): void {
    this.effectiveStudentNumber$
      .pipe(
        filter((sn): sn is string => !!sn),
        tap((studentNumber) => {
          this.studentNumber = studentNumber;
          this.store.dispatch(
            ReportsActions.viewReportsActions.fetchStudentReports({ studentNumber })
          );
          this.store.dispatch(
            invoiceActions.fetchStudentInvoices({ studentNumber })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    // Auto-select first child when parent and linked children load
    combineLatest([this.isParent$, this.linkedChildren$, this.selectedChildStudentNumber$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([isParent, children]) => isParent && (children?.length ?? 0) > 0),
        map(([, children, selected]) => ({ children: children!, selected })),
        filter(({ selected }) => !selected),
        take(1)
      )
      .subscribe(({ children }) => {
        this.selectedChildStudentNumber$.next(children[0].studentNumber);
      });

    // Populate filter options dynamically from fetched reports
    this.studentReports$.pipe(takeUntil(this.destroy$)).subscribe((reports) => {
      const terms = new Set<number>();
      const years = new Set<number>();
      reports.forEach((report) => {
        if (report.report.termNumber) terms.add(report.report.termNumber);
        if (report.report.termYear) years.add(report.report.termYear);
      });
      this.availableTerms = Array.from(terms).sort((a, b) => a - b);
      this.availableYears = Array.from(years).sort((a, b) => b - a); // Newest year first
    });
  }

  onReportSelect(): void {
    // Clear any previously selected report
    this.store.dispatch(
      ReportsActions.viewReportsActions.clearSelectedReport()
    );

    // Combine selected filters with student reports and invoices to determine selection and display eligibility
    combineLatest([this.studentReports$, this.allInvoices$])
      .pipe(
        filter(([reports, invoices]) => !!reports && !!invoices),
        takeUntil(this.destroy$)
      )
      .subscribe(([reports, invoices]) => {
        const foundReport = reports.find(
          (report) =>
            report.report.termNumber === this.selectedTerm &&
            report.report.termYear === this.selectedYear &&
            report.report.examType === this.selectedExamType
        );

        if (foundReport) {
          // Check if the report can be displayed based on invoice balance
          if (this.canDisplayReport(foundReport, invoices)) {
            this.store.dispatch(
              ReportsActions.viewReportsActions.selectStudentReport({
                report: foundReport,
              })
            );
            // Clear any error message if a report is successfully selected
            this.store.dispatch(
              ReportsActions.viewReportsActions.setReportsErrorMsg({
                errorMsg: '',
              })
            );
          } else {
            // If report cannot be displayed due to balance, clear selection and maybe show an error
            this.store.dispatch(
              ReportsActions.viewReportsActions.clearSelectedReport()
            );
            // Dispatch an action to show a user-friendly message about pending balance
            this.store.dispatch(
              ReportsActions.viewReportsActions.setReportsErrorMsg({
                errorMsg:
                  'Report not available due to pending balance for this term.',
              })
            );
          }
        } else {
          // Clear selected report if nothing matches filters
          this.store.dispatch(
            ReportsActions.viewReportsActions.clearSelectedReport()
          );
          // Clear any previous error message if no report matches
          this.store.dispatch(
            ReportsActions.viewReportsActions.setReportsErrorMsg({
              errorMsg: '',
            })
          );
        }
      });
  }

  clearSelection(): void {
    this.selectedTerm = null;
    this.selectedYear = null;
    this.selectedExamType = null;
    this.store.dispatch(
      ReportsActions.viewReportsActions.clearSelectedReport()
    );
    this.store.dispatch(
      ReportsActions.viewReportsActions.setReportsErrorMsg({
        errorMsg: '',
      })
    ); // Clear error message
  }

  /**
   * Checks if a report can be displayed based on the student's invoice balance for that term.
   * A report is displayed only if the balance on the corresponding invoice is zero.
   *
   * @param report The ReportsModel object for the report being viewed.
   * @param allInvoices An array of all invoices available for the student.
   * @returns True if the report can be displayed, false otherwise.
   */
  public canDisplayReport(
    report: ReportsModel,
    allInvoices: InvoiceModel[] | null
  ): boolean {
    if (!allInvoices || allInvoices.length === 0) {
      // If there are no invoices, assume the report can't be displayed for financial reasons
      return true;
    }

    // Find the invoice that matches the report's term (num) and year
    const matchingInvoice = allInvoices.find(
      (invoice) =>
        invoice.enrol.num === report.num && invoice.enrol.year === report.year
    );

    if (!matchingInvoice) {
      return true;
    }

    if (matchingInvoice) {
      // Check if the balance on the found invoice is zero

      return +matchingInvoice.balance === 0;
    } else {
      // No matching invoice found for this report's term and year.
      // As per the requirement "display the report only if the balance on an invoice... is zero",
      // an invoice must exist and be paid. So, if no matching invoice, then false.
      return false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(
      ReportsActions.viewReportsActions.clearSelectedReport()
    ); // Clean up on component destroy
    this.store.dispatch(
      ReportsActions.viewReportsActions.setReportsErrorMsg({
        errorMsg: '',
      })
    ); // Clear error message on destroy
  }
}
