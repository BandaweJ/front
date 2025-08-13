import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
  getEnrolmentByClass,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { RegisterModel } from '../models/register.model';
import { markRegisterActions } from '../store/attendance.actions';
import { selectAttendances } from '../store/attendance.selectors';

@Component({
  selector: 'app-mark-register',
  templateUrl: './mark-register.component.html',
  styleUrls: ['./mark-register.component.css'],
})
export class MarkRegisterComponent implements OnInit {
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  registerForm!: FormGroup;
  attendances$!: Observable<RegisterModel[]>;
  today = new Date();

  constructor(
    public title: Title,
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    this.attendances$ = this.store.select(selectAttendances);

    this.attendances$.subscribe((attendances) => {
      this.dataSource.data = attendances;
    });

    this.registerForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
    });
  }

  get term() {
    return this.registerForm.get('term');
  }

  get clas() {
    return this.registerForm.get('clas');
  }

  displayedColumns: string[] = [
    'studentNumber',
    'surname',
    'name',
    'gender',
    'action',
  ];

  public dataSource = new MatTableDataSource<RegisterModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectWeek() {
    return Array(7)
      .fill(new Date())
      .map((el, idx) => new Date(el.setDate(el.getDate() - el.getDay() + idx)));
  }

  fetchClassList() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    this.store.dispatch(
      markRegisterActions.fetchTodayRegisterByClass({ name, num, year })
    );
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

  markPresent(attendance: RegisterModel, present: boolean) {
    this.store.dispatch(
      markRegisterActions.markRegister({ attendance, present })
    );
  }
}
