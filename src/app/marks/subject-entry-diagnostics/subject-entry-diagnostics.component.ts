import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

import { selectClasses, selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { fetchClasses, fetchTerms } from 'src/app/enrolment/store/enrolment.actions';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { formatTermLabel } from 'src/app/enrolment/models/term-label.util';
import { fetchSubjects } from '../store/marks.actions';
import { selectSubjects } from '../store/marks.selectors';
import { SubjectsModel } from '../models/subjects.model';
import { ExamType } from '../models/examtype.enum';
import { MarksService } from '../services/marks.service';
import {
  SubjectEntryDiagnosticsResponse,
  SubjectEntryDiagnosticsRow,
  SubjectEntryMissingStudent,
} from '../models/subject-entry-diagnostics.model';

@Component({
  selector: 'app-subject-entry-diagnostics',
  templateUrl: './subject-entry-diagnostics.component.html',
  styleUrls: ['./subject-entry-diagnostics.component.css'],
})
export class SubjectEntryDiagnosticsComponent implements OnInit {
  filtersForm!: FormGroup;
  loading = false;
  diagnostics: SubjectEntryDiagnosticsResponse | null = null;

  terms$ = this.store.select(selectTerms);
  classes$ = this.store.select(selectClasses);
  subjects$ = this.store.select(selectSubjects).pipe(
    map((subjects) => [...(subjects ?? [])].sort((a, b) => (a.code || '').localeCompare(b.code || '')))
  );

  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  enteredColumns = ['studentNumber', 'studentName', 'mark', 'comment', 'savedAt'];
  missingColumns = ['studentNumber', 'studentName'];
  enteredData = new MatTableDataSource<SubjectEntryDiagnosticsRow>([]);
  missingData = new MatTableDataSource<SubjectEntryMissingStudent>([]);

  constructor(
    private store: Store,
    private marksService: MarksService,
    private snackBar: MatSnackBar,
    public title: Title
  ) {}

  ngOnInit(): void {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchSubjects());

    this.filtersForm = new FormGroup({
      term: new FormControl('', Validators.required),
      examType: new FormControl('', Validators.required),
      className: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
    });
  }

  get termControl() {
    return this.filtersForm.get('term');
  }

  get examTypeControl() {
    return this.filtersForm.get('examType');
  }

  get classControl() {
    return this.filtersForm.get('className');
  }

  get subjectControl() {
    return this.filtersForm.get('subject');
  }

  runDiagnostics(): void {
    if (this.filtersForm.invalid) {
      this.filtersForm.markAllAsTouched();
      this.snackBar.open('Please select term, exam type, class, and subject.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const term = this.termControl?.value as TermsModel;
    const className = this.classControl?.value as string;
    const examType = this.examTypeControl?.value as ExamType;
    const subject = this.subjectControl?.value as SubjectsModel;

    this.loading = true;
    this.marksService
      .getSubjectEntryDiagnostics(
        term.num,
        term.year,
        className,
        subject.code,
        examType,
        term.id
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result) => {
          this.diagnostics = result;
          this.enteredData.data = result.enteredStudents ?? [];
          this.missingData.data = result.missingStudents ?? [];
        },
        error: (error) => {
          const message =
            error?.error?.message || 'Failed to run subject diagnostics. Please try again.';
          this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        },
      });
  }

  formatTerm(term: TermsModel): string {
    return formatTermLabel(term);
  }

  trackByTerm(index: number, term: TermsModel): string {
    return `${term.id}-${term.num}-${term.year}`;
  }

  trackByClass(index: number, clas: ClassesModel): string {
    return clas.id;
  }

  trackBySubject(index: number, subject: SubjectsModel): string {
    return subject.code;
  }
}
