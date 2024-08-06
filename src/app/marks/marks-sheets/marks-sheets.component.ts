import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { ReportModel } from 'src/app/reports/models/report.model';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ExamType } from '../models/examtype.enum';

@Component({
  selector: 'app-marks-sheets',
  templateUrl: './marks-sheets.component.html',
  styleUrls: ['./marks-sheets.component.css'],
})
export class MarksSheetsComponent implements OnInit {
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

    // this.markSheet$ = this.store.select(selectMarkSheet);
    this.store.select(selectMarkSheet).subscribe((reps) => {
      // create an array to store modified reports
      const modifiedReports: ReportsModel[] = [];
      //create set to add all subjects done in class
      const subjectsArr: SubjectsModel[] = [];
      //loop throu all reports adding all subjs on rep.report to the set
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
      //craete array from subjects and sort the array
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
        // newReport.report.subjectsTable = newSubjectsTable;
        modifiedReports.push(newReport);
      });

      // reps.sort((a, b) => a.report.classPosition - b.report.classPosition);

      this.reports = [...modifiedReports];

      // console.log(modifiedReports);
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

  // Mark Sheet Table Data

  download() {
    let data = document.getElementById('marksheet');
    if (data)
      html2canvas(data, { scale: 4 }).then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png'); // 'image/jpeg' for lower quality output.
        // let pdf = new jspdf('l', 'cm', 'a4'); //Generates PDF in landscape mode
        let pdf = new jspdf.jsPDF('l', 'cm', 'a4'); //Generates PDF in portrait mode

        pdf.addImage(contentDataURL, 'PNG', 0, 0, 29.7, 21, 'fit');
        // pdf.save('Filename.pdf');
        pdf.save(
          `Term ${this.reports[0].num} ${this.reports[0].year}, ${this.reports[0].name} Marksheet.pdf`
        );
        // this.store.dispatch(generatePdfActions.generatePdfSuccess());
      });
  }
}
