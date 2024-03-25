import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import * as reportsActions from '../store/reports.actions';
import { ReportsModel } from '../models/reports.model';
import { selectReports } from '../store/reports.selectors';
import { ReportModel } from '../models/report.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  reportsForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  reports$!: Observable<ReportsModel[]>;
  reports!: ReportsModel[];
  role = '';

  constructor(private store: Store) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.reports$ = this.store.select(selectReports);
    this.reports$.subscribe((reps) => (this.reports = reps));

    this.reportsForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
    });

    this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });
  }

  get term() {
    return this.reportsForm.get('term');
  }

  get clas() {
    return this.reportsForm.get('clas');
  }

  generate() {
    const name = this.clas?.value;

    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;

    // console.log('name', name, 'num', num, 'year', year);

    this.store.dispatch(reportsActions.generateReports({ name, num, year }));
  }

  saveReports() {
    const reports = this.reports;

    const name = this.clas?.value;

    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;

    this.store.dispatch(
      reportsActions.saveReportActions.saveReports({ name, num, year, reports })
    );
  }

  viewReports() {
    const reports = this.reports;

    const name = this.clas?.value;

    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;

    this.store.dispatch(
      reportsActions.viewReportsActions.viewReports({ name, num, year })
    );
  }
}
