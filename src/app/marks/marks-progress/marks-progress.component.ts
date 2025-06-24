import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs'; // Import Subject
import { takeUntil, tap } from 'rxjs/operators'; // Import takeUntil, tap
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar

import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors'; // Ensure correct path
import { ExamType } from '../models/examtype.enum';
import { fetchMarksProgressActions } from '../store/marks.actions';
import { TermsModel } from 'src/app/enrolment/models/terms.model'; // Ensure correct path
import { ClassesModel } from 'src/app/enrolment/models/classes.model'; // Ensure correct path
import { SubjectsModel } from '../models/subjects.model'; // Ensure this model is actually used (it's not in the displayedColumns)
import { MarksProgressModel } from '../models/marks-progress.model';
import { selectMarksProgress } from '../store/marks.selectors';
import { selectIsLoading } from '../marks-sheets/store/selectors'; // Ensure correct path

@Component({
  selector: 'app-marks-progress',
  templateUrl: './marks-progress.component.html',
  styleUrls: ['./marks-progress.component.css'],
})
export class MarksProgressComponent implements OnInit, OnDestroy {
  // Implement OnDestroy
  constructor(
    public title: Title,
    private store: Store,
    private snackBar: MatSnackBar
  ) {}

  marksProgressForm!: FormGroup;
  isLoading = this.store.select(selectIsLoading);
  terms$ = this.store.select(selectTerms);
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  classes$ = this.store.select(selectClasses);
  progressData$ = this.store.select(selectMarksProgress);

  dataSource = new MatTableDataSource<MarksProgressModel>();
  displayedColumns: string[] = [
    'code',
    'subject',
    // 'className', // If you uncomment these, make sure they exist in the data and HTML
    // 'teacherName',
    'totalStudents',
    'marksEntered',
    'progress',
  ];

  private destroy$ = new Subject<void>(); // Subject for managing subscriptions

  ngOnInit() {
    this.marksProgressForm = new FormGroup({
      term: new FormControl('', Validators.required),
      examType: new FormControl('', Validators.required),
      clas: new FormControl('', Validators.required),
    });

    this.progressData$
      .pipe(
        takeUntil(this.destroy$), // Unsubscribe when component is destroyed
        tap((data) => {
          this.dataSource.data = data;
        })
      )
      .subscribe();

    // Optionally, if you have an error selector from marks.selectors:
    // this.store.select(selectMarksError)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(error => {
    //     if (error) {
    //       this.snackBar.open(error, 'Dismiss', { duration: 5000, verticalPosition: 'top' });
    //       // Dispatch an action to clear the error state after showing
    //       // this.store.dispatch(marksActions.clearError());
    //     }
    //   });
  }

  // Implement ngOnDestroy to clean up subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to signal destruction
    this.destroy$.complete(); // Complete the subject
  }

  // Getter for easy access to form controls in the template for error handling
  get termControl() {
    return this.marksProgressForm.get('term');
  }

  get examTypeControl() {
    return this.marksProgressForm.get('examType');
  }

  get clasControl() {
    return this.marksProgressForm.get('clas');
  }

  fetchProgressData() {
    if (this.marksProgressForm.invalid) {
      this.snackBar.open(
        'Please select Term, Exam Type, and Class to fetch progress data.',
        'Close',
        { duration: 3000 }
      );
      this.marksProgressForm.markAllAsTouched(); // Mark controls as touched to show errors
      return;
    }

    const term: TermsModel = this.termControl?.value;
    const num = term.num;
    const year = term.year;

    const clas = this.clasControl?.value;
    const examType = this.examTypeControl?.value;

    this.store.dispatch(
      fetchMarksProgressActions.fetchMarksProgress({
        num,
        year,
        clas,
        examType,
      })
    );
  }

  // trackBy functions for better performance with *ngFor (optional but good practice)
  trackByTerm(index: number, term: TermsModel): any {
    return term.num + term.year; // Assuming num and year are unique for a term
  }

  trackByClass(index: number, clas: ClassesModel): any {
    return clas.name; // Assuming class name is unique
  }
}
