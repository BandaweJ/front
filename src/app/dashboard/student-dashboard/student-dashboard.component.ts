import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  filter,
  Observable,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';
import { User } from 'src/app/auth/models/user.model';

import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { ContinuousAssessmentService, ContinuousAssessmentAnalytics } from 'src/app/marks/continuous-assessment/continuous-assessment.service';
import { InvoiceChargesApiService, InvoiceCharge } from 'src/app/payment/invoice-charges-api.service';
import { StudentDashboardFacade } from './student-dashboard.facade';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  public dashboardSummary$: Observable<StudentDashboardSummary | null>;
  public summaryLoading$: Observable<boolean>;
  public summaryLoaded$: Observable<boolean>;

  public studentDetails$: Observable<StudentsModel | null>;
  public currentEnrolment$: Observable<EnrolsModel | null>;
  public enrolmentLoading$: Observable<boolean>;
  public enrolmentLoaded$: Observable<boolean>;

  public caAnalytics: ContinuousAssessmentAnalytics | null = null;
  public caLoading = false;

  public liabilities: InvoiceCharge[] = [];
  public liabilitiesLoading = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private store: Store,
    private studentDashboardFacade: StudentDashboardFacade,
    private caService: ContinuousAssessmentService,
    private chargesApi: InvoiceChargesApiService,
  ) {
    this.dashboardSummary$ = this.studentDashboardFacade.dashboardSummary$;
    this.summaryLoading$ = this.studentDashboardFacade.summaryLoading$;
    this.summaryLoaded$ = this.studentDashboardFacade.summaryLoaded$;

    this.currentEnrolment$ = this.studentDashboardFacade.currentEnrolment$;
    this.enrolmentLoading$ = this.studentDashboardFacade.enrolmentLoading$;
    this.enrolmentLoaded$ = this.studentDashboardFacade.enrolmentLoaded$;

    this.studentDetails$ = this.studentDashboardFacade.getStudentDetails$();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      (this.store.select(selectUser) as Observable<User | null>)
        .pipe(
          // Filter for a valid user with an ID
          filter((user): user is User => !!user && !!user.id),
          // Take only the first emission to prevent multiple dispatches
          take(1),
          // Use a tap operator to perform side-effects (dispatching actions)
          // This runs as soon as a valid user is found
          tap((user) => {
            const studentNumber = user.id;

            this.studentDashboardFacade.initializeStudent(studentNumber);
            this.loadContinuousAssessmentAnalytics(studentNumber);
            this.loadLiabilities(studentNumber);
          })
        )
        .subscribe()
    );

  }

  private loadContinuousAssessmentAnalytics(studentNumber: string) {
    this.caLoading = true;
    this.caService.getStudentAnalytics(studentNumber).subscribe({
      next: (analytics) => {
        this.caAnalytics = analytics;
        this.caLoading = false;
      },
      error: () => {
        this.caLoading = false;
      },
    });
  }

  private loadLiabilities(studentNumber: string) {
    this.liabilitiesLoading = true;
    // We need current enrolment term/year; use the store's current enrolment once loaded.
    this.subscriptions.add(
      this.currentEnrolment$
        .pipe(
          filter((e): e is EnrolsModel => !!e && typeof e.num === 'number' && typeof e.year === 'number'),
          take(1),
          switchMap((enrol) =>
            this.chargesApi.getPendingChargesForInvoice(studentNumber, enrol.num, enrol.year),
          ),
        )
        .subscribe({
          next: (res) => {
            this.liabilities = (res.pendingCharges ?? []).filter((c) => !c.isVoided);
            this.liabilitiesLoading = false;
          },
          error: () => {
            this.liabilities = [];
            this.liabilitiesLoading = false;
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  buildStudyPriorityTip(summary: StudentDashboardSummary | null): string {
    if (!summary?.academicSummary) {
      return 'Keep submitting assessments consistently to improve predictive confidence.';
    }
    const best = Number(summary.academicSummary.bestPosition?.position ?? NaN);
    const worst = Number(summary.academicSummary.worstPosition?.position ?? NaN);
    if (!isNaN(best) && !isNaN(worst) && worst - best > 8) {
      return 'Your class position swings a lot between terms. Focus on consistency in weaker subjects.';
    }
    return 'Maintain steady revision and practice in all subjects to protect your term average.';
  }

  buildFinanceRiskTip(summary: StudentDashboardSummary | null): string {
    const owed = Number(summary?.financialSummary?.amountOwed ?? 0);
    if (owed > 0) {
      return 'Outstanding balances can affect access to some school services; plan payments early.';
    }
    return 'Great job keeping fees current. Continue tracking charges each term.';
  }
}
