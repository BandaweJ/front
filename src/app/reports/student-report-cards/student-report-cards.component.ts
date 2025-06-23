import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import * as ReportsActions from '../store/reports.actions';
import * as ReportsSelectors from '../store/reports.selectors';
import * as AuthSelectors from 'src/app/auth/store/auth.selectors';
import { ReportsModel } from '../models/reports.model';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { Router } from '@angular/router'; // Import Router if you want to navigate

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

  studentNumber: string | null = null;
  private destroy$ = new Subject<void>();

  // For displaying available terms/years in filter (optional, can be generated from studentReports$)
  availableTerms: number[] = [];
  availableYears: number[] = [];
  availableExamTypes: ExamType[] = Object.values(ExamType).filter(
    (value) => typeof value === 'string' && value !== ''
  ) as ExamType[];

  // Filter form controls
  selectedTerm: number | null = null;
  selectedYear: number | null = null;
  selectedExamType: ExamType | null = null;

  constructor(private store: Store, private router: Router) {
    this.studentReports$ = this.store.select(
      ReportsSelectors.selectStudentReports
    );
    this.selectedReport$ = this.store.select(
      ReportsSelectors.selectSelectedReport
    );
    this.isLoading$ = this.store.select(ReportsSelectors.selectIsLoading);
    this.errorMessage$ = this.store.select(
      ReportsSelectors.selectReportsErrorMsg
    );
  }

  ngOnInit(): void {
    this.store
      .select(AuthSelectors.selectUser)
      .pipe(
        filter((user) => !!user?.id), // Only proceed if studentNumber exists
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.studentNumber = user!.id;
        this.store.dispatch(
          ReportsActions.viewReportsActions.fetchStudentReports({
            studentNumber: this.studentNumber!,
          })
        );
      });

    // Populate filter options dynamically from fetched reports
    this.studentReports$.pipe(takeUntil(this.destroy$)).subscribe((reports) => {
      const terms = new Set<number>();
      const years = new Set<number>();
      reports.forEach((report) => {
        if (report.report.termNumber) terms.add(report.report.termNumber);
        if (report.report.termYear) years.add(report.report.termYear);
        // ExamType is already handled by the enum
      });
      this.availableTerms = Array.from(terms).sort((a, b) => a - b);
      this.availableYears = Array.from(years).sort((a, b) => b - a); // Newest year first
    });
  }

  onReportSelect(): void {
    // Find the selected report from the available list
    this.studentReports$.pipe(takeUntil(this.destroy$)).subscribe((reports) => {
      const foundReport = reports.find(
        (report) =>
          report.report.termNumber === this.selectedTerm &&
          report.report.termYear === this.selectedYear &&
          report.report.examType === this.selectedExamType
      );

      if (foundReport) {
        this.store.dispatch(
          ReportsActions.viewReportsActions.selectStudentReport({
            report: foundReport,
          })
        );
      } else {
        // Clear selected report if nothing matches
        this.store.dispatch(
          ReportsActions.viewReportsActions.clearSelectedReport()
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(
      ReportsActions.viewReportsActions.clearSelectedReport()
    ); // Clean up on component destroy
  }
}
