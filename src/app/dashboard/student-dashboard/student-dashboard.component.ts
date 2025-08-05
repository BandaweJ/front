import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { MarksModel } from 'src/app/marks/models/marks.model';
import { studentMarksActions } from 'src/app/marks/store/marks.actions';
import {
  selectStudentMarks,
  selectStudentMarksLoaded, // IMPORT NEW SELECTOR
  selectStudentMarksLoading, // IMPORT NEW SELECTOR
} from 'src/app/marks/store/marks.selectors'; // Adjust path
import { StudentDashboardSummary } from '../models/student-dashboard-summary';
import {
  selectStudentDashboardLoaded,
  selectStudentDashboardLoading,
  selectStudentDashboardSummary,
} from '../store/dashboard.selectors';
import { studentDashboardActions } from '../store/dashboard.actions';
import { User } from 'src/app/auth/models/user.model';

import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import {
  selectCurrentEnrolment,
  selectCurrentEnrolmentLoaded,
  selectCurrentEnrolmentLoading,
} from 'src/app/enrolment/store/enrolment.selectors';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';
import { StudentsModel } from 'src/app/registration/models/students.model';
import {
  invoiceActions,
  receiptActions,
} from 'src/app/finance/store/finance.actions';

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

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [],
    labels: [],
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Term & Exam Type',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%';
            }
            return label;
          },
        },
      },
    },
  };
  public lineChartType: 'line' = 'line';

  private subscriptions: Subscription = new Subscription();

  constructor(private store: Store) {
    this.dashboardSummary$ = this.store.select(selectStudentDashboardSummary);
    this.summaryLoading$ = this.store.select(selectStudentDashboardLoading);
    this.summaryLoaded$ = this.store.select(selectStudentDashboardLoaded);

    this.currentEnrolment$ = this.store.select(selectCurrentEnrolment);
    this.enrolmentLoading$ = this.store.select(selectCurrentEnrolmentLoading);
    this.enrolmentLoaded$ = this.store.select(selectCurrentEnrolmentLoaded);

    this.studentDetails$ = this.currentEnrolment$.pipe(
      map((enrolment) => (enrolment ? enrolment.student : null))
    );
  }

  ngOnInit(): void {
    // Separate subscription for fetching student marks
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

            this.store.dispatch(
              studentMarksActions.fetchStudentMarks({
                studentNumber,
              })
            );
            this.store.dispatch(
              receiptActions.fetchStudentOutstandingBalance({
                studentNumber,
              })
            );
            this.store.dispatch(
              studentDashboardActions.fetchStudentDashboardSummary({
                studentNumber,
              })
            );
            this.store.dispatch(
              invoiceActions.fetchStudentInvoices({
                studentNumber,
              })
            );
            this.store.dispatch(
              receiptActions.fetchStudentReceipts({
                studentNumber,
              })
            );
            this.store.dispatch(
              currentEnrolementActions.fetchCurrentEnrolment({
                studentNumber,
              })
            );
          })
        )
        .subscribe()
    );
    // Subscription for processing marks and updating the chart (reacts to state changes)
    this.subscriptions.add(
      this.store
        .select(selectStudentMarks)
        .pipe(
          // The chart should update whenever marks data changes (including initial empty state after fetch)
          map((marks) => this.processMarksForGraph(marks))
        )
        .subscribe(({ labels, datasets }) => {
          this.lineChartData = { labels, datasets };
        })
    );

    // REVISED Dashboard Summary & Enrolment Data Fetching (already good, just including for completeness)
    this.subscriptions.add(
      (this.store.select(selectUser) as Observable<User | null>)
        .pipe(
          filter((user): user is User => !!user && !!user.id),
          map((user: User) => user.id),
          distinctUntilChanged(),
          switchMap((studentId) =>
            combineLatest([
              this.store.select(selectStudentDashboardLoaded),
              this.store.select(selectStudentDashboardLoading),
              this.store.select(selectCurrentEnrolmentLoaded),
              this.store.select(selectCurrentEnrolmentLoading),
            ]).pipe(
              filter(
                ([
                  summaryLoaded,
                  summaryLoading,
                  enrolmentLoaded,
                  enrolmentLoading,
                ]) =>
                  (!summaryLoaded && !summaryLoading) ||
                  (!enrolmentLoaded && !enrolmentLoading)
              ),
              take(1),
              tap(
                ([
                  summaryLoaded,
                  summaryLoading,
                  enrolmentLoaded,
                  enrolmentLoading,
                ]) => {
                  if (!summaryLoaded && !summaryLoading) {
                    this.store.dispatch(
                      studentDashboardActions.fetchStudentDashboardSummary({
                        studentNumber: studentId,
                      })
                    );
                  }
                  if (!enrolmentLoaded && !enrolmentLoading) {
                    this.store.dispatch(
                      currentEnrolementActions.fetchCurrentEnrolment({
                        studentNumber: studentId,
                      })
                    );
                  }
                }
              )
            )
          )
        )
        .subscribe()
    );
  }

  private processMarksForGraph(marks: MarksModel[]) {
    const marksBySubject: { [subjectName: string]: MarksModel[] } = {};
    const uniqueTermLabels = new Set<string>();

    marks.forEach((mark) => {
      const subjectName = mark.subject.name;
      if (!marksBySubject[subjectName]) {
        marksBySubject[subjectName] = [];
      }
      marksBySubject[subjectName].push(mark);
      uniqueTermLabels.add(this.getTermExamLabel(mark));
    });

    const sortedUniqueLabels = Array.from(uniqueTermLabels).sort((a, b) => {
      const parseLabel = (label: string) => {
        const match = label.match(/Term (\d+) (\d{4})/);
        if (match) {
          return { num: parseInt(match[1]), year: parseInt(match[2]) };
        }
        return { num: 0, year: 0 };
      };

      const aParsed = parseLabel(a);
      const bParsed = parseLabel(b);

      if (aParsed.year !== bParsed.year) {
        return aParsed.year - bParsed.year;
      }
      return aParsed.num - bParsed.num;
    });

    const datasets: ChartConfiguration<'line'>['data']['datasets'] = [];

    Object.keys(marksBySubject).forEach((subjectName) => {
      const subjectMarks = marksBySubject[subjectName];
      const dataForSubject: (number | null)[] = new Array(
        sortedUniqueLabels.length
      ).fill(null);

      subjectMarks.forEach((mark) => {
        const label = this.getTermExamLabel(mark);
        const index = sortedUniqueLabels.indexOf(label);
        if (
          index !== -1 &&
          mark.mark !== null &&
          typeof mark.mark === 'number'
        ) {
          dataForSubject[index] = mark.mark;
        }
      });

      datasets.push({
        data: dataForSubject,
        label: subjectName,
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      });
    });

    return { labels: sortedUniqueLabels, datasets };
  }

  private getTermExamLabel(mark: MarksModel): string {
    const termLabel = `Term ${mark.num} ${mark.year}`;
    return mark.examType ? `${termLabel} (${mark.examType})` : termLabel;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
