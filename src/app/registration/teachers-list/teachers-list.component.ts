import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { TeachersModel } from '../models/teachers.model';
import {
  // selectDeleteSuccess,
  selectIsLoading,
  selectRegErrorMsg,
  selectTeachers,
} from '../store/registration.selectors';
import { map, Observable } from 'rxjs';
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
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

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
    public title: Title,
    private router: Router
  ) {
    this.store.dispatch(fetchTeachers());
  }

  private teachers$!: Observable<TeachersModel[]>;
  filteredTeachers$!: Observable<TeachersModel[]>;
  public errorMsg$!: Observable<string>;
  public isLoading$ = this.store.select(selectIsLoading);

  filtersForm!: FormGroup;

  displayedColumns: string[] = [
    'id',

    'title',
    'surname',
    'name',
    'role',
    'cell',
    'email',
    // 'address',

    // 'active',

    'action',
  ];
  public dataSource = new MatTableDataSource<TeachersModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.filtersForm = new FormGroup({
      males: new FormControl(true),
      females: new FormControl(true),
      active: new FormControl(true),
      inactive: new FormControl(true),
    });
    this.teachers$ = this.store.select(selectTeachers);
    this.errorMsg$ = this.store.select(selectRegErrorMsg);
    this.teachers$.subscribe((teachers) => {
      this.dataSource.data = teachers;
    });

    // Filter teachers based on form changes
    this.filteredTeachers$ = this.teachers$.pipe(
      map((teachers) => this.applyFilters(teachers))
    );

    this.filteredTeachers$.subscribe((filteredTeachers) => {
      this.dataSource.data = filteredTeachers;
    });

    // Subscribe to form value changes to trigger filtering
    this.filtersForm.valueChanges.subscribe(() => {
      this.filteredTeachers$ = this.teachers$.pipe(
        map((teachers) => this.applyFilters(teachers))
      );
      this.filteredTeachers$.subscribe((filteredTeachers) => {
        this.dataSource.data = filteredTeachers;
      });
    });
  }

  applyFilters(teachers: any[]): any[] {
    // Replace 'any' with your Teacher type
    if (!teachers) {
      return [];
    }

    return teachers.filter((teacher) => {
      const isMale = this.males?.value && teacher.gender === 'Male';
      const isFemale = this.females?.value && teacher.gender === 'Female';
      const isActive = this.active?.value && teacher.active === true;
      const isInactive = this.inactive?.value && teacher.active === false;

      return isMale || isFemale || isActive || isInactive;
    });
  }

  get males() {
    return this.filtersForm.get('males');
  }
  get females() {
    return this.filtersForm.get('females');
  }
  get active() {
    return this.filtersForm.get('active');
  }
  get inactive() {
    return this.filtersForm.get('inactive');
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

  getRowColor(teacher: TeachersModel): string {
    if (teacher.active === false) {
      return 'inactive';
    } else return 'active';
  }

  openTeacherView(teacher: TeachersModel) {
    this.router.navigate(['/teacher-view', teacher.id]);
  }
}
