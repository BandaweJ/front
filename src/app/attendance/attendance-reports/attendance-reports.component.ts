import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { attendanceActions } from '../store/attendance.actions';
import { 
  selectAttendanceReports, 
  selectAttendanceSummary, 
  selectAttendanceLoading, 
  selectAttendanceError 
} from '../store/attendance.selectors';
import { AttendanceReport, AttendanceSummary } from '../services/attendance.service';

@Component({
  selector: 'app-attendance-reports',
  templateUrl: './attendance-reports.component.html',
  styleUrls: ['./attendance-reports.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceReportsComponent implements OnInit, OnDestroy {
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  reportsForm!: FormGroup;
  attendanceReports$!: Observable<AttendanceReport | null>;
  attendanceSummary$!: Observable<AttendanceSummary | null>;
  isLoading$!: Observable<boolean>;
  errorMsg$!: Observable<string>;
  
  destroy$ = new Subject<void>();

  constructor(
    public title: Title,
    private store: Store,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.reportsForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
    });
  }

  private setupObservables(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.attendanceReports$ = this.store.select(selectAttendanceReports);
    this.attendanceSummary$ = this.store.select(selectAttendanceSummary);
    this.isLoading$ = this.store.select(selectAttendanceLoading);
    this.errorMsg$ = this.store.select(selectAttendanceError);

    // Handle error messages
    this.errorMsg$.pipe(
      takeUntil(this.destroy$),
      tap(errorMsg => {
        if (errorMsg) {
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      })
    ).subscribe();
  }

  get term() {
    return this.reportsForm.get('term');
  }

  get clas() {
    return this.reportsForm.get('clas');
  }

  generateReports(): void {
    if (this.reportsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;

    // Use term's startDate and endDate
    const startDate = term.startDate ? new Date(term.startDate).toISOString().split('T')[0] : undefined;
    const endDate = term.endDate ? new Date(term.endDate).toISOString().split('T')[0] : undefined;

    // Generate both reports and summary
    this.store.dispatch(
      attendanceActions.getAttendanceReports({
        className: name,
        termNum: num,
        year,
        startDate,
        endDate
      })
    );

    this.store.dispatch(
      attendanceActions.getAttendanceSummary({
        className: name,
        termNum: num,
        year
      })
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reportsForm.controls).forEach(key => {
      const control = this.reportsForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormErrorMessage(controlName: string): string {
    const control = this.reportsForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    return '';
  }

  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      term: 'Term',
      clas: 'Class'
    };
    return fieldNames[controlName] || controlName;
  }

  getSortedDates(reports: AttendanceReport | null): string[] {
    if (!reports) return [];
    return Object.keys(reports).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  getAttendanceStatusIcon(present: boolean): string {
    return present ? 'check_circle' : 'cancel';
  }

  getAttendanceStatusColor(present: boolean): string {
    return present ? 'present' : 'absent';
  }

  getAttendanceStatusText(present: boolean): string {
    return present ? 'Present' : 'Absent';
  }

  getGenderIcon(gender: string): string {
    return gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }

  getGenderColor(gender: string): string {
    return gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateAttendanceRate(summary: AttendanceSummary | null): number {
    if (!summary || summary.totalRecords === 0) return 0;
    return Math.round((summary.presentCount / summary.totalRecords) * 100);
  }
}

