import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from '../models/classes.model';
import { TermsModel } from '../models/terms.model';
import { EnrolsModel } from '../models/enrols.model';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
} from '../store/enrolment.selectors';
import {
  UnenrolStudentActions,
  fetchClasses,
  fetchEnrols,
  fetchTerms,
  getEnrolmentByClass,
} from '../store/enrolment.actions';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EnrolStudentComponent } from './enrol-student/enrol-student.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms-classes',
  templateUrl: './terms-classes.component.html',
  styleUrls: ['./terms-classes.component.css'],
})
export class TermsClassesComponent implements OnInit, AfterViewInit {
  classes$!: Observable<ClassesModel[]>;
  terms$!: Observable<TermsModel[]>;
  enrols$!: Observable<EnrolsModel[]>;
  private errorMsg$!: Observable<string>;
  public dataSource = new MatTableDataSource<EnrolsModel>();
  enrolForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public title: Title
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
    // this.store.dispatch(fetchEnrols());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.enrols$ = this.store.select(selectEnrols);
    this.enrols$.subscribe((enrols) => {
      this.dataSource.data = enrols;
    });

    this.enrolForm = new FormGroup({
      clas: new FormControl('', [Validators.required]),
      term: new FormControl('', [Validators.required]),
    });
  }

  get clas() {
    return this.enrolForm.get('clas');
  }

  get term() {
    return this.enrolForm.get('term');
  }

  displayedColumns = [
    'studentNumber',
    'surname',
    'name',
    'gender',
    'age',
    'cell',
    'address',
    'prevSchool',
    'action',
  ];

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

  fetchClassList() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    // console.log(`Name: ${name}, Num: ${num}, Year: ${year}`);
    this.store.dispatch(getEnrolmentByClass({ name, num, year }));
  }

  openEnrolStudentsDialog() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    const data = {
      name,
      num,
      year,
    };

    const dialogRef = this.dialog.open(EnrolStudentComponent, {
      data: data,
      height: '80vh',
      width: '70vw',
    });
    dialogRef.disableClose = true;
  }

  unenrolStudent(enrol: EnrolsModel) {
    this.store.dispatch(UnenrolStudentActions.unenrolStudent({ enrol }));
  }
}
