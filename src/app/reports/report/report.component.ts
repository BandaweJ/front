import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ReportsModel } from '../models/reports.model';
import { ReportModel } from '../models/report.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  downloadReportActions,
  saveHeadCommentActions,
} from '../store/reports.actions';
import jsPDF from 'jspdf';
import html2PDF from 'jspdf-html2canvas';
import { HeadCommentModel } from '../models/comment.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';

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

  constructor(private store: Store) {}

  commentForm!: FormGroup;

  ngOnInit(): void {
    this.commentForm = new FormGroup({
      comment: new FormControl(this.report.report.headComment, [
        Validators.required,
      ]),
    });

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
    const name = this.report.report.className;
    const num = this.report.report.termNumber;
    const year = this.report.report.termYear;
    const studentNumber = this.report.studentNumber;

    this.store.dispatch(
      downloadReportActions.downloadReport({ name, num, year, studentNumber })
    );
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
