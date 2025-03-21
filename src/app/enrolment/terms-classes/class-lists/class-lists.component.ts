import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TermsModel } from '../../models/terms.model';
import { Store } from '@ngrx/store';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
} from '../../store/enrolment.selectors';
import { Title } from '@angular/platform-browser';
import { getEnrolmentByClass } from '../../store/enrolment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { EnrolsModel } from '../../models/enrols.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StudentsModel } from 'src/app/registration/models/students.model';

@Component({
  selector: 'app-class-lists',
  templateUrl: './class-lists.component.html',
  styleUrls: ['./class-lists.component.css'],
})
export class ClassListsComponent implements OnInit {
  constructor(private store: Store, public title: Title) {}

  classes$ = this.store.select(selectClasses);
  terms$ = this.store.select(selectTerms);
  enrols$ = this.store.select(selectEnrols);
  classForm!: FormGroup;

  public dataSource = new MatTableDataSource<StudentsModel>();
  displayedColumns: string[] = [
    'studentNumber',
    'surname',
    'name',
    'gender',
    'residence',
  ];

  ngOnInit(): void {
    this.classForm = new FormGroup({
      term: new FormControl('', Validators.required),
      clas: new FormControl('', Validators.required),
    });

    this.enrols$.subscribe((enrols) => {
      const students: StudentsModel[] = enrols.map((enrol) => enrol.student);
      this.dataSource.data = students;
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  get clas() {
    return this.classForm.get('clas');
  }

  get term() {
    return this.classForm.get('term');
  }

  fetchClassList() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    this.store.dispatch(getEnrolmentByClass({ name, num, year }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
