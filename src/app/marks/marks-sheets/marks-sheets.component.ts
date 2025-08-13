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
import { ExamType } from '../models/examtype.enum';

import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-marks-sheets',
  templateUrl: './marks-sheets.component.html',
  styleUrls: ['./marks-sheets.component.css'],
})
export class MarksSheetsComponent implements OnInit {
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

    // Your existing code to process reports
    this.store.select(selectMarkSheet).subscribe((reps) => {
      const modifiedReports: ReportsModel[] = [];
      const subjectsArr: SubjectsModel[] = [];

      // First, find all unique subjects across all reports
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

      // Second, pad the subjectsTable for each report to a consistent length
      reps.map((rep) => {
        const newSubjectsTable = Array<SubjectInfoModel>(this.subjects.length); // Initialize with a fixed length
        rep.report.subjectsTable.map((subjInfo) => {
          const code = subjInfo.subjectCode;
          const name = subjInfo.subjectName;
          const subjPosInSubjsArr = this.subjects.findIndex(
            (sbj) => sbj.code === code && sbj.name === name
          );
          // Place subject info at its correct, fixed position
          newSubjectsTable[subjPosInSubjsArr] = subjInfo;
        });

        const newReport: ReportsModel = {
          ...rep,
          report: {
            ...rep.report,
            subjectsTable: newSubjectsTable, // All tables now have the same length
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

  // You can keep the printDocument() as a fallback for users who prefer it.
  printDocument(): void {
    console.log('Print button clicked. Triggering browser print dialog.');
    window.print();
  }

  // ADDED: The new downloadPDF method
  downloadPDF(): void {
    if (!this.marksheetTable || !this.reports.length) {
      console.error('Marksheet table or data not available.');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape mode
    const header = this.pdfHeader.nativeElement;
    const table = this.marksheetTable.nativeElement;

    // First, add the header content using html2canvas
    html2canvas(header, { scale: 2 }).then((canvas) => {
      const headerImgData = canvas.toDataURL('image/png');
      const headerHeight =
        (canvas.height * doc.internal.pageSize.getWidth()) / canvas.width;
      doc.addImage(
        headerImgData,
        'PNG',
        0,
        0,
        doc.internal.pageSize.getWidth(),
        headerHeight
      );

      // Then, add the table using jspdf-autotable
      (doc as any).autoTable({
        html: table,
        startY: headerHeight + 5, // Start table below the header with some padding
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          halign: 'center',
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 50,
          fontStyle: 'bold',
        },
        bodyStyles: {
          textColor: 50,
        },
        rowPageBreak: 'avoid', // This is the key setting to prevent splitting rows
        didDrawPage: (data: any) => {
          // If you need to add the header to every page, you can do it here
          // This ensures the header is on the first page and all subsequent pages if the table is long
          if (data.pageNumber > 1) {
            doc.addImage(
              headerImgData,
              'PNG',
              0,
              0,
              doc.internal.pageSize.getWidth(),
              headerHeight
            );
            (doc as any).autoTable({
              head: data.head,
              startY: headerHeight + 5, // Repeat the header on the new page
              theme: 'grid',
              styles: {
                fontSize: 7,
                cellPadding: 2,
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
              },
              headStyles: {
                fillColor: [240, 240, 240],
                textColor: 50,
                fontStyle: 'bold',
              },
            });
          }
        },
      });

      // Save the PDF
      const fileName = `${this.reports[0].name}_Marksheet_${this.reports[0].num}_${this.reports[0].year}.pdf`;
      doc.save(fileName);
    });
  }
}
