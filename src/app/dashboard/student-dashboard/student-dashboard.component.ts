import { Component, OnInit, OnDestroy } from '@angular/core'; // Add OnDestroy
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
import { selectStudentMarks } from 'src/app/marks/store/marks.selectors';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';
import {
  selectStudentDashboardLoaded,
  selectStudentDashboardLoading,
  selectStudentDashboardSummary,
} from '../store/dashboard.selectors';
import { studentDashboardActions } from '../store/dashboard.actions';
import { User } from 'src/app/auth/models/user.model';

// --- NEW IMPORTS FOR ENROLMENT AND STUDENT DETAILS ---
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model'; // Adjust path as needed
import {
  selectCurrentEnrolment,
  selectCurrentEnrolmentLoaded, // Assuming these selectors exist in your enrolment store
  selectCurrentEnrolmentLoading, // Assuming these selectors exist in your enrolment store
} from 'src/app/enrolment/store/enrolment.selectors'; // Adjust path
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';
import { StudentsModel } from 'src/app/registration/models/students.model';
// --- END NEW IMPORTS ---

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  // Implement OnInit and OnDestroy
  // Observables for the new dashboard summary data
  public dashboardSummary$: Observable<StudentDashboardSummary | null>;
  public summaryLoading$: Observable<boolean>;
  public summaryLoaded$: Observable<boolean>;

  // --- NEW Observables for Student Details and Current Enrolment ---
  public studentDetails$: Observable<StudentsModel | null>;
  public currentEnrolment$: Observable<EnrolsModel | null>;
  public enrolmentLoading$: Observable<boolean>;
  public enrolmentLoaded$: Observable<boolean>;
  // --- END NEW Observables ---

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
        max: 100, // Assuming marks are out of 100
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

  private subscriptions: Subscription = new Subscription(); // Use a single Subscription for all

  constructor(private store: Store) {
    // Initialize new observables
    this.dashboardSummary$ = this.store.select(selectStudentDashboardSummary);
    this.summaryLoading$ = this.store.select(selectStudentDashboardLoading);
    this.summaryLoaded$ = this.store.select(selectStudentDashboardLoaded);

    // --- Initialize NEW Observables ---
    this.currentEnrolment$ = this.store.select(selectCurrentEnrolment);
    this.enrolmentLoading$ = this.store.select(selectCurrentEnrolmentLoading);
    this.enrolmentLoaded$ = this.store.select(selectCurrentEnrolmentLoaded);

    // Derive student details from currentEnrolment$ for convenience in template
    this.studentDetails$ = this.currentEnrolment$.pipe(
      map((enrolment) => (enrolment ? enrolment.student : null))
    );
    // --- END Initialize NEW Observables ---
  }

  ngOnInit(): void {
    // Combine the user selector and the student marks selector
    this.subscriptions.add(
      combineLatest([
        this.store.select(selectUser) as Observable<User | null>, // Get the current user
        this.store.select(selectStudentMarks), // Get the student marks from the store
      ])
        .pipe(
          // Filter: Ensure user exists and has a studentNumber (which is user.id)
          filter(([user, marks]) => {
            return !!user && !!user.id;
          }),
          // Tap: Dispatch fetchMarks if user and studentNumber are available and marks haven't been fetched
          tap(([user, marks]) => {
            // Check if marks array is empty or null, then dispatch
            if (user!.id && (!marks || marks.length === 0)) {
              this.store.dispatch(
                studentMarksActions.fetchStudentMarks({
                  studentNumber: user!.id,
                })
              );
            }
          }),
          // Map: Transform the marks into Chart.js format
          map(([user, marks]) => this.processMarksForGraph(marks))
        )
        .subscribe(({ labels, datasets }) => {
          // Update Chart.js data
          this.lineChartData = { labels, datasets }; // Reassigning the whole object triggers chart update
        })
    );

    // --- REVISED Dashboard Summary Data Fetching ---
    this.subscriptions.add(
      (this.store.select(selectUser) as Observable<User | null>)
        .pipe(
          // 1. Ensure user and ID exist and are distinct
          filter((user): user is User => !!user && !!user.id),
          map((user: User) => user.id),
          distinctUntilChanged(), // Only proceed if the user ID actually changes

          // 2. Use switchMap to handle the fetch logic for each distinct user ID
          switchMap((studentId) =>
            combineLatest([
              this.store.select(selectStudentDashboardLoaded),
              this.store.select(selectStudentDashboardLoading),
              // --- ADD ENROLMENT LOADED/LOADING SELECTORS TO THIS COMBINELATEST ---
              this.store.select(selectCurrentEnrolmentLoaded),
              this.store.select(selectCurrentEnrolmentLoading),
              // --- END ADD ---
            ]).pipe(
              // Filter to ensure data is not already loaded or currently loading for THIS studentId
              filter(
                ([
                  summaryLoaded,
                  summaryLoading,
                  enrolmentLoaded,
                  enrolmentLoading,
                ]) =>
                  (!summaryLoaded && !summaryLoading) ||
                  (!enrolmentLoaded && !enrolmentLoading) // Trigger if either summary or enrolment needs fetching
              ),
              // Take only one emission that satisfies the condition for this studentId
              take(1),
              tap(
                ([
                  summaryLoaded,
                  summaryLoading,
                  enrolmentLoaded,
                  enrolmentLoading,
                ]) => {
                  // Dispatch summary fetch if not loaded/loading
                  if (!summaryLoaded && !summaryLoading) {
                    this.store.dispatch(
                      studentDashboardActions.fetchStudentDashboardSummary({
                        studentNumber: studentId,
                      })
                    );
                  }
                  // --- DISPATCH ENROLMENT FETCH IF NOT LOADED/LOADING ---
                  if (!enrolmentLoaded && !enrolmentLoading) {
                    this.store.dispatch(
                      currentEnrolementActions.fetchCurrentEnrolment({
                        studentNumber: studentId,
                      })
                    );
                  }
                  // --- END DISPATCH ---
                }
              )
            )
          )
        )
        .subscribe() // This subscription listens for the outer stream, which triggers the inner switchMap
    );
  }

  /**
   * Transforms raw MarksModel array into Chart.js compatible labels and datasets.
   * Creates a separate dataset (line) for each subject.
   *
   * @param marks The raw array of MarksModel objects.
   * @returns An object containing `labels` (for X-axis) and `datasets` (for lines).
   */
  private processMarksForGraph(marks: MarksModel[]) {
    // A map to hold marks grouped by subject name
    const marksBySubject: { [subjectName: string]: MarksModel[] } = {};

    // A set to collect all unique term labels for the X-axis
    const uniqueTermLabels = new Set<string>();

    // 1. Group marks by subject and collect all unique term labels
    marks.forEach((mark) => {
      const subjectName = mark.subject.name; // Use mark.subject.name for the subject
      if (!marksBySubject[subjectName]) {
        marksBySubject[subjectName] = [];
      }
      marksBySubject[subjectName].push(mark);

      // Create a unique label for each mark point, considering term and examType
      uniqueTermLabels.add(this.getTermExamLabel(mark));
    });

    // Sort the unique labels to ensure chronological order on the X-axis
    const sortedUniqueLabels = Array.from(uniqueTermLabels).sort((a, b) => {
      // Example custom sort: Parse termYear and termNum from string labels
      // This assumes a format like "Term X YYYY (Type)"
      const parseLabel = (label: string) => {
        const match = label.match(/Term (\d+) (\d{4})/);
        if (match) {
          return { num: parseInt(match[1]), year: parseInt(match[2]) };
        }
        return { num: 0, year: 0 }; // Fallback for labels that don't match
      };

      const aParsed = parseLabel(a);
      const bParsed = parseLabel(b);

      // Sort by year first, then by term number
      if (aParsed.year !== bParsed.year) {
        return aParsed.year - bParsed.year;
      }
      return aParsed.num - bParsed.num;
    });

    // 2. Create datasets for each subject
    const datasets: ChartConfiguration<'line'>['data']['datasets'] = [];

    Object.keys(marksBySubject).forEach((subjectName) => {
      const subjectMarks = marksBySubject[subjectName];
      // Initialize with nulls to represent missing data points for specific term/exam combos
      const dataForSubject: (number | null)[] = new Array(
        sortedUniqueLabels.length
      ).fill(null);

      // Map subject marks to the correct position on the shared X-axis
      subjectMarks.forEach((mark) => {
        const label = this.getTermExamLabel(mark);
        const index = sortedUniqueLabels.indexOf(label);
        // Ensure index is valid and mark.mark is a number (not null)
        if (
          index !== -1 &&
          mark.mark !== null &&
          typeof mark.mark === 'number'
        ) {
          dataForSubject[index] = mark.mark; // Use mark.mark for the score
        }
      });

      datasets.push({
        data: dataForSubject,
        label: subjectName, // Use subjectName for the legend
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
        // You can add distinct colors here if needed, e.g.,
        // borderColor: this.getColorForSubject(subjectName),
        // backgroundColor: this.getColorForSubject(subjectName),
      });
    });

    return { labels: sortedUniqueLabels, datasets };
  }

  // Helper to generate a consistent label for each mark point using your ExamType enum
  private getTermExamLabel(mark: MarksModel): string {
    const termLabel = `Term ${mark.num} ${mark.year}`; // Use mark.num and mark.year
    // Use examType if present and not 'choose', otherwise just the term label
    return mark.examType ? `${termLabel} (${mark.examType})` : termLabel;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions when the component is destroyed
    this.subscriptions.unsubscribe();
  }
}
