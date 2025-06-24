import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, Subject } from 'rxjs';
import { takeUntil, tap, map, filter, startWith } from 'rxjs/operators'; // Import startWith
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

  reports$: Observable<ReportsModel[]> = this.store.pipe(select(selectReports));
  isLoading$: Observable<boolean> = this.store.pipe(select(selectIsLoading));
  errorMsg$: Observable<string> = this.store.pipe(
    select(selectReportsErrorMsg)
  );

  private destroy$ = new Subject<void>();

  overallAnalysisData$!: Observable<OverallAnalysisData | null>;
  subjectAnalysisData$!: Observable<SubjectAnalysisData | null>;
  studentPerformanceDataArray$!: Observable<
    StudentPerformanceDisplayData[] | null
  >;

  selectedSubjectCode: string = '';
  availableSubjectsForSelection: { code: string; name: string }[] = [];

  selectedStudent: StudentsModel | null = null;
  availableStudentsForSelection: StudentsModel[] = [];

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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
        display: false,
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
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    this.analysisForm = new FormGroup({
      term: new FormControl(null, Validators.required),
      clas: new FormControl(null, Validators.required),
      examType: new FormControl(null, Validators.required),
      selectedSubject: new FormControl(null), // For reactive form tracking of subject dropdown
      selectedStudent: new FormControl(null), // For reactive form tracking of student dropdown
    });

    // Overall Analysis Data pipeline
    this.overallAnalysisData$ = this.reports$.pipe(
      map((reports) => this.processOverallAnalysis(reports)),
      tap((overallData) => {
        if (overallData) {
          this.availableSubjectsForSelection = overallData.uniqueSubjects;
          this.availableStudentsForSelection = this.extractAllStudents(
            overallData.reportsRaw || []
          );
        } else {
          this.availableSubjectsForSelection = [];
          this.availableStudentsForSelection = [];
        }
        // Reset selections and form controls to null when new reports are loaded/cleared
        this.selectedSubjectCode = '';
        this.selectedStudent = null;
        this.analysisForm
          .get('selectedSubject')
          ?.patchValue(null, { emitEvent: false }); // Use emitEvent: false to prevent recursive triggering of valueChanges
        this.analysisForm
          .get('selectedStudent')
          ?.patchValue(null, { emitEvent: false }); // Same here
      }),
      takeUntil(this.destroy$)
    );

    // Subject Analysis Data pipeline
    this.subjectAnalysisData$ = combineLatest([
      this.reports$,
      this.analysisForm.get('selectedSubject')!.valueChanges.pipe(
        startWith(this.analysisForm.get('selectedSubject')!.value), // Emit initial value of form control
        tap((code) => (this.selectedSubjectCode = code)) // Keep selectedSubjectCode in sync
      ),
    ]).pipe(
      filter(
        ([reports, subjectCode]) =>
          !!reports && reports.length > 0 && !!subjectCode
      ),
      map(([reports, subjectCode]) =>
        this.processSubjectAnalysis(reports, subjectCode)
      ),
      takeUntil(this.destroy$)
    );

    // Student Performance Data pipeline
    this.studentPerformanceDataArray$ = combineLatest([
      this.reports$,
      this.analysisForm.get('selectedStudent')!.valueChanges.pipe(
        startWith(this.analysisForm.get('selectedStudent')!.value), // Emit initial value of form control
        tap((student) => (this.selectedStudent = student)) // Keep selectedStudent in sync
      ),
    ]).pipe(
      filter(
        ([reports, student]) => !!reports && reports.length > 0 && !!student
      ),
      map(([reports, student]) =>
        this.processStudentPerformance(reports, student)
      ),
      takeUntil(this.destroy$)
    );

    this.errorMsg$.pipe(takeUntil(this.destroy$)).subscribe((msg) => {
      if (msg) {
        this.snackBar.open(msg, 'Dismiss', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  get selectedSubjectName(): string {
    const selectedCode = this.analysisForm.get('selectedSubject')?.value;
    const subject = this.availableSubjectsForSelection.find(
      (s) => s.code === selectedCode
    );
    return subject ? subject.name : 'Selected Subject';
  }

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
    this.store.dispatch(
      viewReportsActions.viewReports({
        name: clas,
        num: term.num,
        year: term.year,
        examType: examType,
      })
    );
  }

  compareFn(o1: any, o2: any): boolean {
    if (o1 && o2) {
      if (o1.studentNumber && o2.studentNumber) {
        return o1.studentNumber === o2.studentNumber;
      }
      if (
        typeof o1.num === 'number' &&
        typeof o1.year === 'number' &&
        typeof o2.num === 'number' &&
        typeof o2.year === 'number'
      ) {
        return o1.num === o2.num && o1.year === o2.year;
      }
      if (o1.id && o2.id) {
        return o1.id === o2.id;
      }
      return o1 === o2;
    }
    return o1 === o2;
  }

  onTabChange(event: any): void {
    if (event.index === 0) {
      this.selectedStudent = null;
      this.analysisForm
        .get('selectedStudent')
        ?.patchValue(null, { emitEvent: false });
    } else if (event.index === 1) {
      this.selectedSubjectCode = '';
      this.analysisForm
        .get('selectedSubject')
        ?.patchValue(null, { emitEvent: false });
    }
  }

  onSubjectSelectedForOverallAnalysis(subjectCode: string): void {
    // Setting form control value will trigger the pipeline
    this.analysisForm.get('selectedSubject')?.patchValue(subjectCode);
  }

  onStudentSelectedForIndividualPerformance(student: StudentsModel): void {
    // Setting form control value will trigger the pipeline
    this.analysisForm.get('selectedStudent')?.patchValue(student);
  }

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
      const studentFullName: StudentsModel = {
        studentNumber: reportItem.studentNumber,
        name: reportItem.report.name,
        surname: reportItem.report.surname,
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
      studentAverages.push({
        student: studentFullName,
        averageMark: reportItem.report.percentageAverge,
      });

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
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

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
      reportsRaw: reports,
    };
  }

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
        studentsForSubject.push({
          student: {
            studentNumber: reportItem.studentNumber,
            name: reportItem.report.name,
            surname: reportItem.report.surname,
            dob: new Date(),
            gender: '',
            idnumber: '',
            dateOfJoining: new Date(),
            cell: '',
            email: '',
            address: '',
            prevSchool: '',
            role: null as any,
          },
          mark: subjectInfo.mark,
          grade: subjectInfo.grade,
        });

        gradeCounts[subjectInfo.grade] =
          (gradeCounts[subjectInfo.grade] || 0) + 1;
      }
    });

    studentsForSubject.sort((a, b) => b.mark - a.mark);
    const bestStudents = studentsForSubject.slice(0, 5);
    const worstStudents = studentsForSubject.slice(
      Math.max(0, studentsForSubject.length - 5)
    );

    const gradeOrder = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'Ungraded'];
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

  private extractAllStudents(reports: ReportsModel[]): StudentsModel[] {
    if (!reports) return [];
    const studentsMap = new Map<string, StudentsModel>();
    reports.forEach((reportItem) => {
      const studentDetails: StudentsModel = {
        studentNumber: reportItem.studentNumber,
        name: reportItem.report.name,
        surname: reportItem.report.surname,
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
    subjectsData.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

    const labels = subjectsData.map((s) => s.subjectName);
    const marks = subjectsData.map((s) => (s.mark !== null ? s.mark : 0));

    const chartData: ChartConfiguration<'line'>['data'] = {
      labels: labels,
      datasets: [
        {
          data: marks,
          label: `${student.name} ${student.surname}'s Performance`,
          fill: true,
          tension: 0.3,
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
