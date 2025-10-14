import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectCurrentEnrolment,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import * as reportsActions from '../store/reports.actions';
import { ReportsModel } from '../models/reports.model';
import { selectIsLoading, selectReports } from '../store/reports.selectors';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { viewReportsActions } from '../store/reports.actions';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { take } from 'rxjs/operators'; // Import take operator for saveReports

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit, OnDestroy {
  reportsForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;

  reports$: Observable<ReportsModel[]> = this.store.select(selectReports);

  role = '';
  id!: string;
  mode!: 'generate' | 'view';
  isLoading$ = this.store.select(selectIsLoading); // This is crucial for the spinner
  currentEnrolment!: EnrolsModel;

  // Analytics properties
  totalStudents = 0;
  totalSubjects = 0;
  averageMark = 0;
  passRate = 0;

  private subscriptions: Subscription[] = [];

  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  constructor(private store: Store) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());

    this.subscriptions.push(
      this.store.select(selectCurrentEnrolment).subscribe((enrolment) => {
        if (enrolment) this.currentEnrolment = enrolment;
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(reportsActions.viewReportsActions.resetReports());
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    this.reportsForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      examType: new FormControl('', Validators.required),
    });

    this.subscriptions.push(
      this.store.select(selectUser).subscribe((user) => {
        if (user) {
          this.role = user.role;
          this.id = user.id;

          if (this.role === ROLES.student) {
            this.store.dispatch(
              viewReportsActions.fetchStudentReports({ studentNumber: this.id })
            );
          }
        }
      })
    );

    // Subscribe to reports changes to calculate analytics
    this.subscriptions.push(
      this.reports$.subscribe((reports) => {
        this.calculateAnalytics(reports);
      })
    );
  }

  get term() {
    return this.reportsForm.get('term');
  }

  get clas() {
    return this.reportsForm.get('clas');
  }

  get examType() {
    return this.reportsForm.get('examType');
  }

  // Consolidated method for fetching reports based on form selections
  fetchReportsBasedOnForm() {
    const { term, clas, examType } = this.reportsForm.value;

    if (this.reportsForm.valid) {
      this.store.dispatch(
        reportsActions.viewReportsActions.viewReports({
          name: clas,
          num: term.num,
          year: term.year,
          examType: examType,
        })
      );
    } else {
      // Optional: Provide user feedback if form is invalid
      console.warn('Form is invalid. Cannot fetch reports.');
    }
  }

  generate() {
    this.mode = 'generate';
    const { term, clas, examType } = this.reportsForm.value;

    if (this.reportsForm.valid) {
      this.store.dispatch(
        reportsActions.generateReports({
          name: clas,
          num: term.num,
          year: term.year,
          examType: examType,
        })
      );
    } else {
      console.warn('Form is invalid. Cannot generate reports.');
    }
  }

  saveReports() {
    // Use take(1) to get the current reports value once and complete the subscription
    this.reports$.pipe(take(1)).subscribe((reportsToSave) => {
      const { term, clas, examType } = this.reportsForm.value;

      if (this.reportsForm.valid && reportsToSave && reportsToSave.length > 0) {
        this.store.dispatch(
          reportsActions.saveReportActions.saveReports({
            name: clas,
            num: term.num,
            year: term.year,
            reports: reportsToSave,
            examType: examType,
          })
        );
      } else {
        console.warn('No reports to save or form is invalid.');
      }
    });
  }

  viewReports() {
    this.mode = 'view';
    this.fetchReportsBasedOnForm(); // Call the fetch method when 'View' is clicked
  }

  // Analytics methods
  calculateAnalytics(reports: ReportsModel[]): void {
    if (!reports || reports.length === 0) {
      this.resetAnalytics();
      return;
    }

    this.totalStudents = this.getUniqueStudentsCount(reports);
    this.totalSubjects = this.getUniqueSubjectsCount(reports);
    this.averageMark = this.calculateAverageMark(reports);
    this.passRate = this.calculatePassRate(reports);
  }

  private resetAnalytics(): void {
    this.totalStudents = 0;
    this.totalSubjects = 0;
    this.averageMark = 0;
    this.passRate = 0;
  }

  private getUniqueStudentsCount(reports: ReportsModel[]): number {
    const uniqueStudents = new Set(reports.map(report => report.studentNumber));
    return uniqueStudents.size;
  }

  private getUniqueSubjectsCount(reports: ReportsModel[]): number {
    const uniqueSubjects = new Set<string>();
    
    reports.forEach(report => {
      if (report.report && report.report.subjectsTable) {
        report.report.subjectsTable.forEach(subject => {
          if (subject.subjectCode) {
            uniqueSubjects.add(subject.subjectCode);
          }
        });
      }
    });
    
    return uniqueSubjects.size;
  }

  private calculateAverageMark(reports: ReportsModel[]): number {
    let totalMarks = 0;
    let markCount = 0;

    reports.forEach(report => {
      if (report.report && report.report.subjectsTable) {
        report.report.subjectsTable.forEach(subject => {
          if (subject.mark !== null && subject.mark !== undefined) {
            totalMarks += subject.mark;
            markCount++;
          }
        });
      }
    });

    return markCount > 0 ? Math.round((totalMarks / markCount) * 100) / 100 : 0;
  }

  private calculatePassRate(reports: ReportsModel[]): number {
    let totalMarks = 0;
    let passingMarks = 0;

    reports.forEach(report => {
      if (report.report && report.report.subjectsTable) {
        report.report.subjectsTable.forEach(subject => {
          if (subject.mark !== null && subject.mark !== undefined) {
            totalMarks++;
            if (subject.mark >= 50) { // Assuming 50% is passing
              passingMarks++;
            }
          }
        });
      }
    });

    return totalMarks > 0 ? Math.round((passingMarks / totalMarks) * 100 * 100) / 100 : 0;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
