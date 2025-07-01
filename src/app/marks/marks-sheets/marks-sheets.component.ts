import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { markSheetActions } from './store/actions';
import { selectIsLoading, selectMarkSheet } from './store/selectors';
import { ReportsModel } from 'src/app/reports/models/reports.model';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { SubjectsModel } from '../models/subjects.model';
import { SubjectInfoModel } from 'src/app/reports/models/subject-info.model';
// REMOVED: import * as jspdf from 'jspdf';
// REMOVED: import html2canvas from 'html2canvas';
import { ExamType } from '../models/examtype.enum';

@Component({
  selector: 'app-marks-sheets',
  templateUrl: './marks-sheets.component.html',
  styleUrls: ['./marks-sheets.component.css'],
})
export class MarksSheetsComponent implements OnInit {
  // These ViewChild elements are still useful if you need to access them for other non-PDF-generation reasons,
  // otherwise, you could remove them if they are exclusively for html2canvas/jsPDF
  @ViewChild('pdfReportContainer') pdfReportContainer!: ElementRef;
  @ViewChild('pdfHeader') pdfHeader!: ElementRef;
  @ViewChild('marksheetTable') marksheetTable!: ElementRef;
  @ViewChild('tableHeaderRow') tableHeaderRow!: ElementRef;

  markSheetForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  isLoading$!: Observable<boolean>;
  markSheet$!: Observable<ReportsModel[]>;
  reports!: ReportsModel[];
  subjects: SubjectsModel[] = [];
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  constructor(
    private store: Store,
    private dialog: MatDialog,
    public title: Title
  ) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.isLoading$ = this.store.select(selectIsLoading);

    this.store.select(selectMarkSheet).subscribe((reps) => {
      const modifiedReports: ReportsModel[] = [];
      const subjectsArr: SubjectsModel[] = [];
      reps.forEach((rep) => {
        rep.report.subjectsTable.forEach((subj) => {
          const code = subj.subjectCode;
          const name = subj.subjectName;
          const newSubj = { code, name };
          const found = subjectsArr.find((sbj) => sbj.code === newSubj.code);
          if (!found) {
            subjectsArr.push(newSubj);
          }
        });
      });
      subjectsArr.sort((a, b) => +a.code - +b.code);
      this.subjects = [...subjectsArr];

      reps.map((rep) => {
        const newSubjectsTable = Array<SubjectInfoModel>(this.subjects.length);
        rep.report.subjectsTable.map((subjInfo) => {
          const code = subjInfo.subjectCode;
          const name = subjInfo.subjectName;
          const subjPosInSubjsArr = this.subjects.findIndex(
            (sbj) => sbj.code === code && sbj.name === name
          );
          newSubjectsTable[subjPosInSubjsArr] = subjInfo;
        });
        const newReport: ReportsModel = {
          ...rep,
          report: {
            ...rep.report,
            subjectsTable: newSubjectsTable,
          },
        };
        modifiedReports.push(newReport);
      });

      this.reports = [...modifiedReports];
      console.log('Reports data loaded:', this.reports.length, 'reports');
    });

    this.markSheetForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      examType: new FormControl('', [Validators.required]),
    });
  }

  get term() {
    return this.markSheetForm.get('term');
  }

  get clas() {
    return this.markSheetForm.get('clas');
  }

  get examType() {
    return this.markSheetForm.get('examType');
  }

  fetchMarkSheet() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    const examType = this.examType?.value;

    this.store.dispatch(
      markSheetActions.fetchMarkSheet({ name, num, year, examType })
    );
  }

  // RENAMED from download() to printDocument()
  // REMOVED all html2canvas and jsPDF logic
  printDocument(): void {
    console.log('Print button clicked. Triggering browser print dialog.');
    window.print(); // This is the only line needed now!
  }
}
