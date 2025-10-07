import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StudentsModel } from '../../models/students.model';
import { selectStudents, selectIsLoading, selectRegErrorMsg } from '../../store/registration.selectors';
import { SharedService } from 'src/app/shared.service';
import { Subject, takeUntil, filter, map, switchMap, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddEditStudentComponent } from '../add-edit-student/add-edit-student.component';
import { StudentIdCardComponent } from '../student-id-card/student-id-card.component';
import { deleteStudentAction } from '../../store/registration.actions';

@Component({
  selector: 'app-student-view',
  templateUrl: './student-view.component.html',
  styleUrls: ['./student-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  studentId!: string;
  student!: StudentsModel | undefined;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public title: Title,
    public sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.studentId = this.route.snapshot.params['studentNumber'];
  }

  ngOnInit(): void {
    this.setupLoadingState();
    this.loadStudent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupLoadingState(): void {
    this.store.select(selectIsLoading).pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectRegErrorMsg).pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      this.errorMessage = error;
      this.cdr.markForCheck();
    });
  }

  private loadStudent(): void {
    this.store.select(selectStudents).pipe(
      filter(students => students.length > 0),
      map(students => students.find(st => st.studentNumber === this.studentId)),
      takeUntil(this.destroy$)
    ).subscribe(student => {
      this.student = student;
      if (student) {
        this.title.setTitle(`${student.name} ${student.surname} - Student Details`);
      }
      this.cdr.markForCheck();
    });
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }

  editStudent(): void {
    if (this.student) {
      const dialogRef = this.dialog.open(AddEditStudentComponent, {
        data: this.student,
        width: '90vw',
        maxWidth: '800px',
        disableClose: true
      });

      dialogRef.afterClosed().pipe(
        takeUntil(this.destroy$)
      ).subscribe(result => {
        if (result) {
          this.snackBar.open('Student updated successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  deleteStudent(): void {
    if (this.student && confirm(`Are you sure you want to delete ${this.student.name} ${this.student.surname}?`)) {
      this.store.dispatch(deleteStudentAction({ studentNumber: this.student.studentNumber }));
      this.snackBar.open('Student deleted successfully!', 'Close', {
        duration: 3000,
        verticalPosition: 'top'
      });
      this.router.navigate(['/students']);
    }
  }

  generateIDCard(): void {
    if (this.student) {
      const dialogRef = this.dialog.open(StudentIdCardComponent, {
        data: this.student,
        width: '90vw',
        maxWidth: '800px',
        disableClose: false
      });

      dialogRef.afterClosed().pipe(
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }
}
