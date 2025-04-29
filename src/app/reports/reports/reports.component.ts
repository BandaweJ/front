import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectCurrentEnrolment,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import * as reportsActions from '../store/reports.actions';
import { ReportsModel } from '../models/reports.model';
import {
  selectIsLoading,
  selectReports,
  selectStudentReports,
} from '../store/reports.selectors';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { viewReportsActions } from '../store/reports.actions';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
import { selectedStudentInvoice } from 'src/app/finance/store/finance.selector';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  reportsForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  // reports$: Observable<ReportsModel[]> = this.store.select(selectReports);
  reports$ = this.store.pipe(select(selectReports));
  reports!: ReportsModel[];
  role = '';
  id!: string;
  mode!: 'generate' | 'view';
  isLoading$ = this.store.select(selectIsLoading);
  currentEnrolment!: EnrolsModel;

  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  constructor(private store: Store) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
    this.store.select(selectCurrentEnrolment).subscribe((enrolment) => {
      if (enrolment) this.currentEnrolment = enrolment;
    });
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.reports$ = this.store.select(selectReports);

    this.reports$.subscribe((reps) => {
      this.reports = reps;
      // if (reps)
      // console.log('first head comment is : ', reps[0].report.headComment);
    });

    this.reportsForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      examType: new FormControl('', Validators.required),
    });

    this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
        this.id = user.id;
      }
    });

    if (this.role === ROLES.student) {
      this.store.dispatch(
        viewReportsActions.fetchStudentReports({ studentNumber: this.id })
      );

      const studentNumber = this.id;
      const num = this.currentEnrolment.num;
      const year = this.currentEnrolment.year;
      this.store.dispatch(
        invoiceActions.fetchInvoice({ studentNumber, num, year })
      );
    }
  }

  get term() {
    return this.reportsForm.get('term');
  }

  get clas() {
    return this.reportsForm.get('clas');
  }

  get examType() {
    return this.reportsForm.get('examType');
  }

  generate() {
    this.mode = 'generate';
    const name = this.clas?.value;

    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;
    const examType = this.examType?.value;

    // console.log('name', name, 'num', num, 'year', year);

    this.store.dispatch(
      reportsActions.generateReports({ name, num, year, examType })
    );
  }

  saveReports() {
    const reports = this.reports;

    const name = this.clas?.value;

    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;
    const examType = this.examType?.value;

    this.store.dispatch(
      reportsActions.saveReportActions.saveReports({
        name,
        num,
        year,
        reports,
        examType,
      })
    );
  }

  viewReports() {
    // this.mode = 'view';
    // const reports = this.reports;

    const name = this.clas?.value;

    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;
    const examType = this.examType?.value;

    this.store.dispatch(
      reportsActions.viewReportsActions.viewReports({
        name,
        num,
        year,
        examType,
      })
    );
  }
}
