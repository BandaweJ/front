import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { Store } from '@ngrx/store';
import {
  Observable,
  Subject,
  BehaviorSubject,
  combineLatest,
  of,
} from 'rxjs';
import {
  filter,
  map,
  tap,
  takeUntil,
  take,
  switchMap,
  distinctUntilChanged,
} from 'rxjs/operators';

import { selectLinkedChildrenAnyRole } from 'src/app/auth/store/auth.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import {
  selectCurrentEnrolment,
  selectCurrentEnrolmentLoading,
} from 'src/app/enrolment/store/enrolment.selectors';
import {
  invoiceActions,
  receiptActions,
} from 'src/app/finance/store/finance.actions';
import { studentMarksActions } from 'src/app/marks/store/marks.actions';
import {
  selectStudentMarks,
  selectStudentMarksLoading,
} from 'src/app/marks/store/marks.selectors';
import { MarksModel } from 'src/app/marks/models/marks.model';
import { viewReportsActions } from 'src/app/reports/store/reports.actions';
import {
  selectReports,
  selectStudentPerformanceData,
} from 'src/app/reports/store/reports.selectors';
import { ContinuousAssessmentService, ContinuousAssessmentAnalytics } from 'src/app/marks/continuous-assessment/continuous-assessment.service';
import { ParentDashboardService } from './parent-dashboard.service';
import { ParentDashboardSummaryDto, ChildSummaryDto } from './models/parent-dashboard-summary.model';
import { ThemeService, Theme } from 'src/app/services/theme.service';

type LinkedChild = { studentNumber: string; name?: string; surname?: string };

interface MarksInsights {
  average: number;
  totalCount: number;
  passedCount: number;
  bestSubject?: string;
  bestMark?: number;
  weakestSubject?: string;
  weakestMark?: number;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    NgChartsModule,
  ],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentDashboardComponent implements OnInit, OnDestroy {
  /** Summary from API (parent name + children with profile, enrolment, academics, finance). */
  summary$ = new BehaviorSubject<ParentDashboardSummaryDto | null>(null);
  summaryLoading$ = new BehaviorSubject<boolean>(true);
  summaryError$ = new BehaviorSubject<string | null>(null);

  /** Children from summary for tabs; fallback to auth store when summary not yet loaded. */
  linkedChildren$: Observable<LinkedChild[]>;
  /** Currently selected child index (0-based) for tab. */
  selectedChildIndex$ = new BehaviorSubject<number>(0);
  /** Currently selected child's student number. */
  selectedStudentNumber$: Observable<string | null>;
  /** Selected child from summary API (for cards). */
  selectedChildSummary$: Observable<ChildSummaryDto | null>;
  /** Selected child as StudentsModel for reports selector. */
  selectedChildStudent$: Observable<StudentsModel | null>;

  currentEnrolment$: Observable<EnrolsModel | null>;
  enrolmentLoading$: Observable<boolean>;
  studentMarks$: Observable<MarksModel[]>;
  studentMarksLoading$: Observable<boolean>;
  /** Performance chart data for selected student (from reports). */
  performanceChartData$: Observable<{ student: StudentsModel; chartData: any }[] | null>;

  marksDataSource = new MatTableDataSource<MarksModel>([]);
  marksDisplayedColumns: string[] = ['subject', 'term', 'year', 'mark', 'examType'];
  marksInsights: MarksInsights | null = null;

  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Mark (%)' },
      },
      x: { title: { display: true, text: 'Subject' } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `Mark: ${ctx.raw}%` },
      },
    },
  };
  lineChartType: ChartType = 'line';

  caAnalytics: ContinuousAssessmentAnalytics | null = null;
  caLoading = false;

  currentTheme: Theme = 'light';

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private caService: ContinuousAssessmentService,
    private parentDashboardService: ParentDashboardService,
    private themeService: ThemeService,
  ) {
    this.linkedChildren$ = this.store.select(selectLinkedChildrenAnyRole);

    this.selectedStudentNumber$ = combineLatest([
      this.linkedChildren$,
      this.selectedChildIndex$,
    ]).pipe(
      map(([children, index]) => {
        if (!children?.length || index < 0 || index >= children.length) return null;
        return children[index].studentNumber;
      }),
      distinctUntilChanged()
    );

    this.selectedChildStudent$ = combineLatest([
      this.linkedChildren$,
      this.selectedChildIndex$,
    ]).pipe(
      map(([children, index]) => {
        if (!children?.length || index < 0 || index >= children.length) return null;
        const c = children[index];
        return this.linkedChildToStudentsModel(c);
      })
    );

    /** Selected child from the summary API (for overview cards). */
    this.selectedChildSummary$ = combineLatest([
      this.summary$,
      this.selectedChildIndex$,
    ]).pipe(
      map(([summary, index]) => {
        if (!summary?.children?.length || index < 0 || index >= summary.children.length) return null;
        return summary.children[index];
      })
    );

    this.currentEnrolment$ = this.store.select(selectCurrentEnrolment);
    this.enrolmentLoading$ = this.store.select(selectCurrentEnrolmentLoading);
    this.studentMarks$ = this.store.select(selectStudentMarks);
    this.studentMarksLoading$ = this.store.select(selectStudentMarksLoading);

    this.performanceChartData$ = this.selectedChildStudent$.pipe(
      switchMap((student) =>
        student
          ? this.store.select(selectStudentPerformanceData(student))
          : of(null)
      )
    );
  }

  private linkedChildToStudentsModel(c: LinkedChild): StudentsModel {
    return {
      studentNumber: c.studentNumber,
      name: c.name ?? '',
      surname: c.surname ?? '',
      dob: new Date(),
      gender: '',
      idnumber: '',
      dateOfJoining: new Date(),
      cell: '',
      email: '',
      address: '',
      prevSchool: '',
      role: null as any,
    };
  }

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    this.parentDashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summary$.next(summary);
        this.summaryLoading$.next(false);
        this.summaryError$.next(null);
        if (summary.children?.length) {
          this.selectedChildIndex$.next(0);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.summaryLoading$.next(false);
        this.summaryError$.next(err?.message ?? 'Failed to load summary');
        this.summary$.next(null);
        this.cdr.markForCheck();
      },
    });

    this.summary$
      .pipe(
        filter((s) => (s?.children?.length ?? 0) > 0),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.selectedChildIndex$.next(0));

    this.selectedStudentNumber$
      .pipe(
        filter((sn): sn is string => !!sn),
        tap((studentNumber) => {
          this.store.dispatch(
            invoiceActions.fetchStudentInvoices({ studentNumber })
          );
          this.store.dispatch(
            receiptActions.fetchStudentReceipts({ studentNumber })
          );
          this.store.dispatch(
            studentMarksActions.fetchStudentMarks({ studentNumber })
          );
          this.store.dispatch(
            viewReportsActions.fetchStudentReports({ studentNumber })
          );
          this.loadContinuousAssessment(studentNumber);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.studentMarks$
      .pipe(takeUntil(this.destroy$))
      .subscribe((marks) => {
        this.marksDataSource.data = marks ?? [];
        this.marksInsights = this.buildMarksInsights(marks ?? []);
        this.cdr.markForCheck();
      });
  }

  private buildMarksInsights(marks: MarksModel[]): MarksInsights | null {
    const numeric = (marks || []).filter(
      (m) => typeof m.mark === 'number' && m.mark !== null && !isNaN(m.mark as any),
    );
    if (!numeric.length) return null;

    const totalCount = numeric.length;
    const sum = numeric.reduce((acc, m) => acc + (Number(m.mark) || 0), 0);
    const average = sum / totalCount;

    const sorted = [...numeric].sort((a, b) => (Number(a.mark) || 0) - (Number(b.mark) || 0));
    const weakest = sorted[0];
    const best = sorted[sorted.length - 1];

    const bestSubject =
      best.subject?.name || best.subject?.code || 'Best subject';
    const weakestSubject =
      weakest.subject?.name || weakest.subject?.code || 'Weakest subject';

    const passedCount = numeric.filter((m) => (Number(m.mark) || 0) >= 50).length;

    return {
      average,
      totalCount,
      passedCount,
      bestSubject,
      bestMark: Number(best.mark) || 0,
      weakestSubject,
      weakestMark: Number(weakest.mark) || 0,
    };
  }

  retrySummary(): void {
    this.summaryError$.next(null);
    this.summaryLoading$.next(true);
    this.cdr.markForCheck();
    this.parentDashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summary$.next(summary);
        this.summaryLoading$.next(false);
        this.summaryError$.next(null);
        if (summary.children?.length) this.selectedChildIndex$.next(0);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.summaryLoading$.next(false);
        this.summaryError$.next(err?.message ?? 'Failed to load summary');
        this.cdr.markForCheck();
      },
    });
  }

  private loadContinuousAssessment(studentNumber: string): void {
    this.caLoading = true;
    this.caAnalytics = null;
    this.cdr.markForCheck();
    this.caService.getStudentAnalytics(studentNumber).subscribe({
      next: (analytics) => {
        this.caAnalytics = analytics;
        this.caLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.caLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onChildTabChange(event: MatTabChangeEvent): void {
    this.selectedChildIndex$.next(event.index);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
