import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  fetchStudents,
} from '../store/registration.actions';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

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
    public title: Title,
    private router: Router
  ) {
    this.store.dispatch(fetchStudents());
  }

  private students$!: Observable<StudentsModel[]>;
  private errorMsg$!: Observable<string>;
  public isLoading$ = this.store.select(selectIsLoading);

  displayedColumns: string[] = [
    'studentNumber',

    'surname',
    'name',
    'gender',
    'cell',

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

  openEditStudentView(student: StudentsModel) {
    this.router.navigate(['student-view', student.studentNumber]);
  }
}
