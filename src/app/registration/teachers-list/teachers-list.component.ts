import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TeachersModel } from '../models/teachers.model';
import {
  // selectDeleteSuccess,
  selectIsLoading,
  selectRegErrorMsg,
  selectTeachers,
} from '../store/registration.selectors';
import { Observable } from 'rxjs';
import {
  deleteTeacherAction,
  fetchTeachers,
  resetAddSuccess,
} from '../store/registration.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AddEditTeacherComponent } from './add-edit-teacher/add-edit-teacher.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-teachers-list',
  templateUrl: './teachers-list.component.html',
  styleUrls: ['./teachers-list.component.css'],
})
export class TeachersListComponent implements OnInit, AfterViewInit {
  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public title: Title
  ) {
    this.store.dispatch(fetchTeachers());
  }

  private teachers$!: Observable<TeachersModel[]>;
  public errorMsg$!: Observable<string>;
  public isLoading$ = this.store.select(selectIsLoading);

  displayedColumns: string[] = [
    'id',
    'name',
    'surname',
    'dob',
    'gender',
    'title',
    'dateOfJoining',
    'qualifications',
    // 'active',
    'cell',
    'email',
    'address',
    'dateOfLeaving',
    'action',
  ];
  public dataSource = new MatTableDataSource<TeachersModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.teachers$ = this.store.select(selectTeachers);
    this.errorMsg$ = this.store.select(selectRegErrorMsg);
    this.teachers$.subscribe((teachers) => {
      this.dataSource.data = teachers;
    });

    // this.store.select(selectDeleteSuccess).subscribe((result) => {
    //   if (result === true) {
    //     this.snackBar.open('Teacher Deleted Successfully', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   } else if (result === false) {
    //     this.snackBar.open('Faied to delete Teacher. Check errors shown', '', {
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

  openAddTeacherDialog() {
    const dialogRef = this.dialog.open(AddEditTeacherComponent);
    dialogRef.disableClose = true;
  }

  openEditTeacherDialog(data: TeachersModel) {
    this.dialog.open(AddEditTeacherComponent, { data });
  }

  deleteTeacher(id: string) {
    this.store.dispatch(deleteTeacherAction({ id }));
  }
}
