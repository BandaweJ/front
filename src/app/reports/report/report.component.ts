import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ReportsModel } from '../models/reports.model';
import { ReportModel } from '../models/report.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  downloadReportActions,
  generatePdfActions,
  saveHeadCommentActions,
} from '../store/reports.actions';

import { HeadCommentModel } from '../models/comment.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { selectIsLoading } from '../store/reports.selectors';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  @Input()
  report!: ReportsModel;
  editState = false;
  role = '';
  isLoading$ = this.store.select(selectIsLoading);
  studentNumber = '';

  print = false;

  constructor(private store: Store) {}

  commentForm!: FormGroup;

  ngOnInit(): void {
    this.commentForm = new FormGroup({
      comment: new FormControl(this.report.report.headComment, [
        Validators.required,
      ]),
    });
    this.studentNumber = this.report.report.studentNumber;

    this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });
  }

  get comment() {
    return this.commentForm.get('comment');
  }

  saveComment() {
    if (this.comment?.value) {
      // console.log(this.comment?.value);
      const rep = this.report;
      const comm: string = this.comment.value;

      const comment: HeadCommentModel = {
        comment: comm,
        report: rep,
      };

      this.store.dispatch(saveHeadCommentActions.saveHeadComment({ comment }));
      // this.comment?.setValue(report.headComment);
      this.toggleEditState();
    }
  }

  toggleEditState() {
    this.editState = !this.editState;
  }

  download() {
    // server side pdf generation using pdfkit
    const name = this.report.report.className;
    // const num = this.report.report.termNumber;
    // const year = this.report.report.termYear;
    // const studentNumber = this.report.studentNumber;

    // this.store.dispatch(
    //   downloadReportActions.downloadReport({ name, num, year, studentNumber })
    // );

    // client side pdf generation using jspdf
    this.store.dispatch(generatePdfActions.generatePdf());
    this.print = true;
    let data = document.getElementById(`${this.studentNumber}`);
    if (data)
      html2canvas(data, { scale: 2.0 }).then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png'); // 'image/jpeg' for lower quality output.
        // let pdf = new jspdf('l', 'cm', 'a4'); //Generates PDF in landscape mode
        let pdf = new jspdf.jsPDF('p', 'cm', 'a4'); //Generates PDF in portrait mode

        pdf.addImage(contentDataURL, 'PNG', 0, 0, 21, 29.7, 'fit');
        // pdf.save('Filename.pdf');
        pdf.save(
          `${this.report.studentNumber}-${this.report.report.surname} ${this.report.report.name}.pdf`
        );
        this.store.dispatch(generatePdfActions.generatePdfSuccess());
      });
    this.print = false;

    //client side pdf generation using pdfmake
    // let docDefinition = {
    //   header: 'C#Corner PDF Header',
    //   content:
    //     'Sample PDF generated with Angular and PDFMake for C#Corner Blog',
    // };

    // pdfMake.createPdf(docDefinition).open();
  }

  //   async savePdf() {
  //     const doc = document.getElementById('content');

  //     if (doc) {
  //       html2PDF(doc).then((canvas) => {
  //          var img = canvas.toDataURL('image/PNG');
  //          var doc = new jsPDF('l', 'mm', 'a4', 1);
  //       })

  //     }
  // }
}
