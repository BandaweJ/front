import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StudentsModel } from '../models/students.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  selectIsLoading,
  // selectDeleteSuccess,
  selectRegErrorMsg,
  selectStudents,
} from '../store/registration.selectors';
import { AddEditStudentComponent } from './add-edit-student/add-edit-student.component';
import {
  deleteStudentAction,
  editStudentAction,
  fetchStudents,
  resetAddSuccess,
} from '../store/registration.actions';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.css'],
})
export class StudentsListComponent implements OnInit, AfterViewInit {
  constructor(
    private store: Store,
    private dialog: MatDialog,
    // private dialogRef: MatDialogRef<AddEditStudentComponent>,
    private snackBar: MatSnackBar,
    public title: Title
  ) {
    this.store.dispatch(fetchStudents());
  }

  private students$!: Observable<StudentsModel[]>;
  private errorMsg$!: Observable<string>;
  public isLoading$ = this.store.select(selectIsLoading);

  displayedColumns: string[] = [
    'studentNumber',
    'idnumber',
    'surname',
    'name',
    'gender',
    'dob',
    'dateOfJoining',
    'cell',
    'email',
    'address',
    'prevSchool',
    'action',
  ];

  public dataSource = new MatTableDataSource<StudentsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.students$ = this.store.select(selectStudents);
    this.errorMsg$ = this.store.select(selectRegErrorMsg);
    this.students$.subscribe((students) => {
      this.dataSource.data = students;
    });

    // this.store.select(selectDeleteSuccess).subscribe((result) => {
    //   if (result === true) {
    //     this.snackBar.open('Student Deleted Successfully', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   } else if (result === false) {
    //     this.snackBar.open('Faied to delete Student. Check errors shown', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   }
    // });

    // this.dialog.afterAllClosed.subscribe(() => {
    //   this.store.dispatch(resetAddSuccess());
    // });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddEditStudentDialog() {
    const dialogRef = this.dialog.open(AddEditStudentComponent);
    dialogRef.disableClose = true;
  }

  deleteStudent(studentNumber: string) {
    this.store.dispatch(deleteStudentAction({ studentNumber }));
  }

  openEditStudentDialog(data: StudentsModel) {
    this.dialog.open(AddEditStudentComponent, { data });
  }

  // calculateAge = (dateOfBirth: Date) => {
  //   const today = new Date();
  //   if (dateOfBirth) {
  //     // const years = Math.floor((today - dateOfBirth) / (365 * 24 * 60 * 60));

  //     const years = today - dateOfBirth;
  //     return years;
  //   }
  //   else
  //     return null
  // };
}
