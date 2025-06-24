import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription, combineLatest, Subject } from 'rxjs';
import { takeUntil, tap, map, filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

// Models from your existing project structure
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { ReportsModel } from 'src/app/reports/models/reports.model';
import { StudentsModel } from 'src/app/registration/models/students.model'; // Make sure this path is correct

// NgRx Actions, Selectors from your existing project structure
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';

import {
  selectIsLoading,
  selectReports,
  selectReportsErrorMsg,
} from 'src/app/reports/store/reports.selectors'; // Corrected selectors
import { viewReportsActions } from 'src/app/reports/store/reports.actions'; // Corrected action

// Charting imports
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

// Interfaces for processed data (derived from your request)
interface OverallAnalysisData {
  subjectPassRates: { subjectName: string; passRate: number }[];
  top5StudentsOverall: { student: StudentsModel; averageMark: number }[];
  bottom5StudentsOverall: { student: StudentsModel; averageMark: number }[];
  uniqueSubjects: { code: string; name: string }[];
  reportsRaw: ReportsModel[]; // Added this property to resolve the error
}

interface SubjectAnalysisData {
  bestStudents: { student: StudentsModel; mark: number; grade: string }[];
  worstStudents: { student: StudentsModel; mark: number; grade: string }[];
  gradeDistribution: { grade: string; count: number }[];
}

interface StudentPerformanceDisplayData {
  student: StudentsModel;
  chartData: ChartConfiguration<'line'>['data'];
}

@Component({
  selector: 'app-results-analysis',
  templateUrl: './results-analysis.component.html',
  styleUrls: ['./results-analysis.component.css'],
})
export class ResultsAnalysisComponent implements OnInit, OnDestroy {
  analysisForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  // Raw reports data from NgRx store (aliasing selectComments as selectReports for clarity)
  reports$: Observable<ReportsModel[]> = this.store.pipe(select(selectReports));
  isLoading$: Observable<boolean> = this.store.pipe(select(selectIsLoading));
  errorMsg$: Observable<string> = this.store.pipe(
    select(selectReportsErrorMsg)
  );

  private destroy$ = new Subject<void>();

  // Processed data observables for display in template
  overallAnalysisData$!: Observable<OverallAnalysisData | null>;
  subjectAnalysisData$!: Observable<SubjectAnalysisData | null>;
  studentPerformanceDataArray$!: Observable<
    StudentPerformanceDisplayData[] | null
  >;

  // For per-subject analysis selection
  selectedSubjectCode: string = '';
  availableSubjectsForSelection: { code: string; name: string }[] = [];

  // For per-student analysis selection
  selectedStudent: StudentsModel | null = null;
  availableStudentsForSelection: StudentsModel[] = [];

  // Chart configuration for ng2-charts
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important for flexible sizing
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Marks are out of 100
        title: {
          display: true,
          text: 'Mark (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Subject',
        },
      },
    },
    plugins: {
      legend: {
        display: false, // No legend for single student performance
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Mark: ${context.raw}%`;
          },
        },
      },
    },
  };
  public lineChartType: ChartType = 'line';

  constructor(private store: Store, private snackBar: MatSnackBar) {
    // Dispatch initial actions to load terms and classes for the form
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    // Initialize observables for terms and classes
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    // Initialize the analysis form
    this.analysisForm = new FormGroup({
      term: new FormControl(null, Validators.required),
      clas: new FormControl(null, Validators.required),
      examType: new FormControl(null, Validators.required),
      // Adding form controls for selectedSubject and selectedStudent for reactive forms
      // Even if they are bound via [(ngModel)] in template, having them here ensures reactivity if needed
      selectedSubject: new FormControl(null),
      selectedStudent: new FormControl(null),
    });

    // --- Data Processing Pipelines ---

    // Overall Analysis Data pipeline
    this.overallAnalysisData$ = this.reports$.pipe(
      map((reports) => this.processOverallAnalysis(reports)),
      tap((overallData) => {
        // When overall data is processed, update available subjects and students for dropdowns
        if (overallData) {
          this.availableSubjectsForSelection = overallData.uniqueSubjects;
          this.availableStudentsForSelection = this.extractAllStudents(
            overallData.reportsRaw || []
          ); // reportsRaw holds original reports
        } else {
          this.availableSubjectsForSelection = [];
          this.availableStudentsForSelection = [];
        }
        // Reset selections if reports change or become null
        this.selectedSubjectCode = '';
        this.selectedStudent = null;
        // Also update form controls for consistency
        this.analysisForm.get('selectedSubject')?.patchValue(null);
        this.analysisForm.get('selectedStudent')?.patchValue(null);
      }),
      takeUntil(this.destroy$)
    );

    // Subject Analysis Data pipeline (depends on reports and selectedSubjectCode from form control)
    this.subjectAnalysisData$ = combineLatest([
      this.reports$,
      this.analysisForm.get('selectedSubject')!.valueChanges.pipe(
        // Start with the initial value for immediate processing if selection is pre-set
        // or if overallData processing sets it. This ensures it doesn't wait for a change.
        // Also, use distinctUntilChanged() to prevent unnecessary re-emissions
        map((code) => code),
        tap((code) => (this.selectedSubjectCode = code)) // Keep selectedSubjectCode in sync
      ),
    ]).pipe(
      filter(
        ([reports, subjectCode]) =>
          !!reports && reports.length > 0 && !!subjectCode
      ), // Only proceed if data and subjectCode exist
      map(([reports, subjectCode]) =>
        this.processSubjectAnalysis(reports, subjectCode)
      ),
      takeUntil(this.destroy$)
    );

    // Student Performance Data pipeline (depends on reports and selectedStudent from form control)
    this.studentPerformanceDataArray$ = combineLatest([
      this.reports$,
      this.analysisForm.get('selectedStudent')!.valueChanges.pipe(
        // Start with the initial value for immediate processing
        map((student) => student),
        tap((student) => (this.selectedStudent = student)) // Keep selectedStudent in sync
      ),
    ]).pipe(
      filter(
        ([reports, student]) => !!reports && reports.length > 0 && !!student
      ), // Only proceed if data and student exist
      map(([reports, student]) =>
        this.processStudentPerformance(reports, student)
      ),
      takeUntil(this.destroy$)
    );

    // --- Error Message Subscription ---
    this.errorMsg$.pipe(takeUntil(this.destroy$)).subscribe((msg) => {
      if (msg) {
        this.snackBar.open(msg, 'Dismiss', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        // You might want to dispatch an action to clear the error state after showing it
        // this.store.dispatch(marksActions.clearReportsError()); // Define this action if needed
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Signal to all subscriptions to unsubscribe
  }

  // --- Form Control Getters ---
  get termControl() {
    return this.analysisForm.get('term');
  }
  get clasControl() {
    return this.analysisForm.get('clas');
  }
  get examTypeControl() {
    return this.analysisForm.get('examType');
  }
  get selectedSubjectFormControl() {
    return this.analysisForm.get('selectedSubject');
  }
  get selectedStudentFormControl() {
    return this.analysisForm.get('selectedStudent');
  }

  // New getter to get the name of the currently selected subject
  get selectedSubjectName(): string {
    const selectedCode = this.analysisForm.get('selectedSubject')?.value;
    const subject = this.availableSubjectsForSelection.find(
      (s) => s.code === selectedCode
    );
    return subject ? subject.name : 'Selected Subject'; // Default text if not found
  }

  // --- Event Handlers ---

  // Called when "Get Analysis" button is clicked
  fetchAnalysisData() {
    if (this.analysisForm.invalid) {
      this.snackBar.open(
        'Please select Term, Class, and Exam Type to get analysis data.',
        'Close',
        { duration: 3000 }
      );
      this.analysisForm.markAllAsTouched();
      return;
    }

    const { term, clas, examType } = this.analysisForm.value;
    // Dispatch the action to fetch reports based on the form criteria
    this.store.dispatch(
      viewReportsActions.viewReports({
        // Corrected action from marksActions
        name: clas,
        num: term.num,
        year: term.year,
        examType: examType,
      })
    );
  }

  // Helper for mat-select when comparing objects (StudentsModel, TermsModel, ClassesModel)
  compareFn(o1: any, o2: any): boolean {
    if (o1 && o2) {
      if (o1.studentNumber && o2.studentNumber) {
        // For StudentsModel
        return o1.studentNumber === o2.studentNumber;
      }
      if (
        typeof o1.num === 'number' &&
        typeof o2.num === 'number' &&
        typeof o1.year === 'number' &&
        typeof o2.year === 'number'
      ) {
        // For TermsModel
        return o1.num === o2.num && o1.year === o2.year;
      }
      if (o1.id && o2.id) {
        // For ClassesModel (assuming ClassesModel has an 'id')
        return o1.id === o2.id;
      }
      return o1 === o2; // Fallback for primitive values or direct string comparisons
    }
    return o1 === o2;
  }

  // Event handler for tab changes (optional, but good for clearing state/defaults)
  onTabChange(event: any): void {
    // Logic to reset selections when changing tabs if desired
    if (event.index === 0) {
      // Overall Class Analysis tab
      this.selectedStudent = null; // Clear student selection
      this.analysisForm.get('selectedStudent')?.patchValue(null);
    } else if (event.index === 1) {
      // Individual Student Performance tab
      this.selectedSubjectCode = ''; // Clear subject selection
      this.analysisForm.get('selectedSubject')?.patchValue(null);
    }
  }

  // Handler for subject selection dropdown (in Overall Analysis tab for subject-specific view)
  onSubjectSelectedForOverallAnalysis(subjectCode: string): void {
    this.selectedSubjectCode = subjectCode;
    this.analysisForm.get('selectedSubject')?.patchValue(subjectCode); // Keep form control in sync
    // The subjectAnalysisData$ observable will automatically react via the form control
  }

  // Handler for student selection dropdown (in Individual Student Performance tab)
  onStudentSelectedForIndividualPerformance(student: StudentsModel): void {
    this.selectedStudent = student;
    this.analysisForm.get('selectedStudent')?.patchValue(student); // Keep form control in sync
    // The studentPerformanceDataArray$ observable will automatically react via the form control
  }

  // --- Data Processing Helper Functions (Pure functions or class methods) ---

  /**
   * Processes raw ReportsModel[] to generate overall class analysis data.
   * @param reports The array of ReportsModel fetched from the store.
   * @returns OverallAnalysisData or null if no reports.
   */
  private processOverallAnalysis(
    reports: ReportsModel[]
  ): OverallAnalysisData | null {
    if (!reports || reports.length === 0) {
      return null;
    }

    const subjectPassCounts: {
      [subjectCode: string]: {
        totalStudents: number;
        passedStudents: number;
        subjectName: string;
      };
    } = {};
    const studentAverages: { student: StudentsModel; averageMark: number }[] =
      [];
    const uniqueSubjectsMap = new Map<string, { code: string; name: string }>();

    reports.forEach((reportItem) => {
      // Collect student overall averages
      // Ensure all required StudentsModel properties are initialized, even if empty, to match interface
      const studentFullName: StudentsModel = {
        studentNumber: reportItem.studentNumber,
        name: reportItem.report.name,
        surname: reportItem.report.surname,
        dob: new Date(), // Placeholder
        gender: '', // Assuming gender might be in ReportModel.report, or provide default
        idnumber: '', // Placeholder
        dateOfJoining: new Date(), // Placeholder
        cell: '', // Placeholder
        email: '', // Placeholder
        address: '', // Placeholder
        prevSchool: '', // Placeholder
        role: null as any, // Placeholder
      };
      studentAverages.push({
        student: studentFullName,
        averageMark: reportItem.report.percentageAverge,
      });

      // Collect subject pass rates and unique subjects
      reportItem.report.subjectsTable.forEach((subjectInfo) => {
        if (!subjectPassCounts[subjectInfo.subjectCode]) {
          subjectPassCounts[subjectInfo.subjectCode] = {
            totalStudents: 0,
            passedStudents: 0,
            subjectName: subjectInfo.subjectName,
          };
        }
        subjectPassCounts[subjectInfo.subjectCode].totalStudents++;
        if (subjectInfo.mark !== null && subjectInfo.mark >= 50) {
          subjectPassCounts[subjectInfo.subjectCode].passedStudents++;
        }
        uniqueSubjectsMap.set(subjectInfo.subjectCode, {
          code: subjectInfo.subjectCode,
          name: subjectInfo.subjectName,
        });
      });
    });

    const subjectPassRates = Object.values(subjectPassCounts)
      .map((data) => ({
        subjectName: data.subjectName,
        passRate:
          data.totalStudents > 0
            ? (data.passedStudents / data.totalStudents) * 100
            : 0,
      }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName)); // Sort for consistent display

    // Sort and slice for top/bottom 5 students
    studentAverages.sort((a, b) => b.averageMark - a.averageMark);
    const top5StudentsOverall = studentAverages.slice(0, 5);
    const bottom5StudentsOverall = studentAverages.slice(
      Math.max(0, studentAverages.length - 5)
    );

    return {
      subjectPassRates,
      top5StudentsOverall,
      bottom5StudentsOverall,
      uniqueSubjects: Array.from(uniqueSubjectsMap.values()),
      reportsRaw: reports, // Pass raw reports to extract students later
    };
  }

  /**
   * Processes raw ReportsModel[] to generate per-subject analysis data for a specific subject.
   * @param reports The array of ReportsModel.
   * @param subjectCode The code of the subject to analyze.
   * @returns SubjectAnalysisData or null.
   */
  private processSubjectAnalysis(
    reports: ReportsModel[],
    subjectCode: string
  ): SubjectAnalysisData | null {
    if (!reports || reports.length === 0 || !subjectCode) {
      return null;
    }

    const studentsForSubject: {
      student: StudentsModel;
      mark: number;
      grade: string;
    }[] = [];
    const gradeCounts: { [grade: string]: number } = {};

    reports.forEach((reportItem) => {
      const subjectInfo = reportItem.report.subjectsTable.find(
        (s) => s.subjectCode === subjectCode
      );
      if (subjectInfo && subjectInfo.mark !== null) {
        // Ensure all required StudentsModel properties are initialized, even if empty, to match interface
        studentsForSubject.push({
          student: {
            studentNumber: reportItem.studentNumber,
            name: reportItem.report.name,
            surname: reportItem.report.surname,
            dob: new Date(), // Placeholder
            gender: '', // Assuming gender is in ReportModel
            idnumber: '', // Placeholder
            dateOfJoining: new Date(), // Placeholder
            cell: '', // Placeholder
            email: '', // Placeholder
            address: '', // Placeholder
            prevSchool: '', // Placeholder
            role: null as any, // Placeholder
          },
          mark: subjectInfo.mark,
          grade: subjectInfo.grade,
        });

        // Count grades
        gradeCounts[subjectInfo.grade] =
          (gradeCounts[subjectInfo.grade] || 0) + 1;
      }
    });

    studentsForSubject.sort((a, b) => b.mark - a.mark);
    const bestStudents = studentsForSubject.slice(0, 5);
    const worstStudents = studentsForSubject.slice(
      Math.max(0, studentsForSubject.length - 5)
    );

    // Sort grades by a predefined order (e.g., A*, A, B, C...)
    const gradeOrder = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'Ungraded']; // Example order, adjust as needed
    const gradeDistribution = Object.keys(gradeCounts)
      .map((grade) => ({
        grade,
        count: gradeCounts[grade],
      }))
      .sort((a, b) => {
        const indexA = gradeOrder.indexOf(a.grade);
        const indexB = gradeOrder.indexOf(b.grade);
        return (
          (indexA === -1 ? Infinity : indexA) -
          (indexB === -1 ? Infinity : indexB)
        );
      });

    return {
      bestStudents,
      worstStudents,
      gradeDistribution,
    };
  }

  /**
   * Extracts a unique list of StudentsModel from the reports data.
   * Used for the student selection dropdown for individual performance.
   * @param reports The array of ReportsModel.
   * @returns A unique array of StudentsModel.
   */
  private extractAllStudents(reports: ReportsModel[]): StudentsModel[] {
    if (!reports) return [];
    const studentsMap = new Map<string, StudentsModel>();
    reports.forEach((reportItem) => {
      const studentDetails: StudentsModel = {
        studentNumber: reportItem.studentNumber,
        name: reportItem.report.name,
        surname: reportItem.report.surname,
        dob: new Date(), // Placeholder
        gender: '', // Assuming gender is in ReportModel
        idnumber: '', // Placeholder
        dateOfJoining: new Date(), // Placeholder
        cell: '', // Placeholder
        email: '', // Placeholder
        address: '', // Placeholder
        prevSchool: '', // Placeholder
        role: null as any, // Placeholder
      };
      if (!studentsMap.has(studentDetails.studentNumber)) {
        studentsMap.set(studentDetails.studentNumber, studentDetails);
      }
    });
    return Array.from(studentsMap.values()).sort((a, b) => {
      const nameA = `${a.name} ${a.surname}`.toLowerCase();
      const nameB = `${b.name} ${b.surname}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * Processes raw ReportsModel[] to generate performance chart data for a specific student.
   * @param reports The array of ReportsModel.
   * @param student The selected student.
   * @returns An array containing the processed chart data for the student.
   */
  private processStudentPerformance(
    reports: ReportsModel[],
    student: StudentsModel
  ): StudentPerformanceDisplayData[] | null {
    if (!reports || reports.length === 0 || !student) {
      return null;
    }

    const studentReport = reports.find(
      (r) => r.studentNumber === student.studentNumber
    );
    if (!studentReport) {
      return null;
    }

    const subjectsData = studentReport.report.subjectsTable;
    // Sort subjects alphabetically for consistent chart display
    subjectsData.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

    const labels = subjectsData.map((s) => s.subjectName);
    const marks = subjectsData.map((s) => (s.mark !== null ? s.mark : 0)); // Use 0 for null marks on chart

    const chartData: ChartConfiguration<'line'>['data'] = {
      labels: labels,
      datasets: [
        {
          data: marks,
          label: `${student.name} ${student.surname}'s Performance`,
          fill: true,
          tension: 0.3, // Smoothness of the line
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          pointBackgroundColor: 'rgba(75,192,192,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(75,192,192,1)',
        },
      ],
    };

    return [{ student: student, chartData: chartData }];
  }
}
