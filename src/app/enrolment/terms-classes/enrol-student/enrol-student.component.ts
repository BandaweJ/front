import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { EnrolsModel } from '../../models/enrols.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { Store } from '@ngrx/store';
import * as registrationActions from '../../../registration/store/registration.actions';
import { selectStudents } from 'src/app/registration/store/registration.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { enrolStudents } from '../../store/enrolment.actions';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { selectEnrols } from '../../store/enrolment.selectors';
import { Residence } from '../../models/residence.enum';

@Component({
  selector: 'app-enrol-student',
  templateUrl: './enrol-student.component.html',
  styleUrls: ['./enrol-student.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnrolStudentComponent implements OnInit, AfterViewInit, OnDestroy {
  studentsToEnrol: StudentsModel[] = [];
  enrols: EnrolsModel[] = [];
  isLoading = false;
  searchControl = new FormControl('');

  public dataSource = new MatTableDataSource<StudentsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['index', 'studentNumber', 'surname', 'name', 'gender', 'action'];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<EnrolStudentComponent>,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: { name: string; num: number; year: number }
  ) {
    this.store.dispatch(registrationActions.fetchStudents());
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  ngOnInit(): void {
    console.log('EnrolStudentComponent ngOnInit - Starting initialization');
    this.initializeObservables();
    this.setupSearch();
  }


  private initializeObservables(): void {
    combineLatest([
      this.store.select(selectEnrols),
      this.store.select(selectStudents),
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([enrols, allStudents]) => {
          this.enrols = enrols || [];
          this.isLoading = false;
          
          // Check if allStudents is valid and has data
          if (!allStudents || !Array.isArray(allStudents) || allStudents.length === 0) {
            this.store.dispatch(registrationActions.fetchStudents());
            this.dataSource.data = [];
            return;
          }
          
          // Check if students have actual data (not empty objects)
          const validStudents = allStudents.filter(student => 
            student && 
            typeof student === 'object' && 
            Object.keys(student).length > 0 &&
            student.studentNumber
          );
          
          // If no valid students, try to reload after a short delay
          if (validStudents.length === 0) {
            setTimeout(() => {
              this.store.dispatch(registrationActions.fetchStudents());
            }, 1000);
            this.dataSource.data = [];
            return;
          }
          
          // Filter out students who are already enrolled
          const availableStudents = validStudents.filter((student) => {
            return !this.enrols.some(
              (enrol) => enrol.student?.studentNumber === student.studentNumber
            );
          });
          
          this.dataSource.data = availableStudents;
          
          console.log('Data loaded - Available students:', availableStudents.length);
          console.log('Data loaded - First student:', availableStudents[0]);
          console.log('Data loaded - DataSource data:', this.dataSource.data);
          
          // Force change detection and table update
          setTimeout(() => {
            this.cdr.markForCheck();
            console.log('Change detection triggered - DataSource data after CD:', this.dataSource.data);
          }, 0);
        })
      )
      .subscribe();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.dataSource.filter = searchTerm.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.markForCheck();
    
    // Debug: Measure element heights and log data
    setTimeout(() => {
      this.measureElementHeights();
      console.log('AfterViewInit - DataSource data:', this.dataSource.data);
      console.log('AfterViewInit - DataSource length:', this.dataSource.data.length);
      console.log('AfterViewInit - Is loading:', this.isLoading);
    }, 100);
  }

  private measureElementHeights(): void {
    const container = document.getElementById('table-container');
    const wrapper = document.getElementById('table-wrapper');
    const table = document.getElementById('students-table');
    
    if (container) {
      const containerHeight = container.offsetHeight;
      document.getElementById('container-height')!.textContent = `${containerHeight}px`;
    }
    
    if (wrapper) {
      const wrapperHeight = wrapper.offsetHeight;
      document.getElementById('wrapper-height')!.textContent = `${wrapperHeight}px`;
    }
    
    if (table) {
      const tableHeight = table.offsetHeight;
      document.getElementById('table-height')!.textContent = `${tableHeight}px`;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Signal to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }

  addToEnrolList(student: StudentsModel): void {
    this.studentsToEnrol.push(student);
    this.dataSource.data = this.dataSource.data.filter(
      (st) => st.studentNumber !== student.studentNumber
    );
    this.applyFilter(null);
    this.cdr.markForCheck();
    
    this.snackBar.open(`${student.name} ${student.surname} added to enrollment list`, 'Close', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  removeFromEnrolList(student: StudentsModel): void {
    this.studentsToEnrol = this.studentsToEnrol.filter(
      (st) => st.studentNumber !== student.studentNumber
    );
    this.dataSource.data = [student, ...this.dataSource.data];
    this.applyFilter(null);
    this.cdr.markForCheck();
    
    this.snackBar.open(`${student.name} ${student.surname} removed from enrollment list`, 'Close', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  /**
   * Custom filter predicate for MatTableDataSource to search within StudentsModel properties.
   * Filters by student number, surname, name, gender.
   * @param data The StudentsModel object for the current row.
   * @param filter The filter string entered by the user.
   * @returns True if the row matches the filter, false otherwise.
   */
  customFilterPredicate = (data: StudentsModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    // Concatenate all relevant string fields from StudentsModel
    const dataStr = (
      data.studentNumber +
      data.surname +
      data.name +
      data.gender
    )
      // data.residence can also be added if needed, but it's optional in model
      // + (data.residence || '')
      .toLowerCase();

    return dataStr.includes(searchString);
  };

  /**
   * Applies the filter to the MatTableDataSource.
   * @param event The keyup event from the filter input, or null/dummy for programmatic calls.
   */
  applyFilter(event: Event | null) {
    // Allow null for programmatic calls
    const filterValue = event
      ? (event.target as HTMLInputElement).value
      : this.dataSource.filter;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  enrolStudents(): void {
    if (this.studentsToEnrol.length === 0) {
      this.snackBar.open('Please select at least one student to enroll', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const enrolsToDispatch: EnrolsModel[] = this.studentsToEnrol.map((student) => ({
      student,
      name: this.data.name,
      num: this.data.num,
      year: this.data.year,
      residence: Residence.Boarder,
    }));

    this.store.dispatch(enrolStudents({ enrols: enrolsToDispatch }));
    
    this.snackBar.open(`Successfully enrolled ${this.studentsToEnrol.length} student(s)`, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
    
    this.dialogRef.close();
  }

  trackByStudentId(index: number, student: StudentsModel): string {
    return student.studentNumber || `${index}`;
  }
}
