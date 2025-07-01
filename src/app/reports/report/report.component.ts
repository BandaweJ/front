import { Component, Input, OnInit } from '@angular/core'; // No OnDestroy needed here if no subscriptions are kept
import { ReportsModel } from '../models/reports.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  downloadReportActions,
  saveHeadCommentActions,
} from '../store/reports.actions';

import { HeadCommentModel } from '../models/comment.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';

import { selectIsLoading } from '../store/reports.selectors';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { Subscription } from 'rxjs'; // Import Subscription

// pdfMake.vfs = pdfFonts.pdfMake.vfs; // Commented out as per original

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  @Input()
  report!: ReportsModel;
  editState = false;
  role = ''; // Initialize role
  isLoading$ = this.store.select(selectIsLoading);
  studentNumber = '';

  private userSubscription: Subscription | undefined; // Declare subscription

  constructor(private store: Store) {}

  commentForm!: FormGroup;

  ngOnInit(): void {
    this.commentForm = new FormGroup({
      comment: new FormControl(this.report.report.headComment, [
        Validators.required,
      ]),
    });
    this.studentNumber = this.report.report.studentNumber;

    this.userSubscription = this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });
  }

  // Add ngOnDestroy to unsubscribe if the component might not be destroyed and recreated quickly
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get comment() {
    return this.commentForm.get('comment');
  }

  saveComment() {
    if (this.comment?.valid) {
      // Check for validity of the form control
      const rep = this.report;
      const comm: string = this.comment.value;

      const comment: HeadCommentModel = {
        comment: comm,
        report: rep,
      };

      this.store.dispatch(saveHeadCommentActions.saveHeadComment({ comment }));
      this.toggleEditState(); // Toggle state after dispatching
    }
  }

  toggleEditState() {
    this.editState = !this.editState;
    // When toggling to edit state, ensure the form control value is updated
    // with the latest report comment, in case it was updated by another user or process.
    if (this.editState) {
      this.commentForm.get('comment')?.setValue(this.report.report.headComment);
    }
  }

  download() {
    const { report } = this.report; // Destructure for cleaner access
    const {
      className: name,
      termNumber: num,
      termYear: year,
      examType: examType,
      studentNumber,
    } = report;

    if (examType) {
      // Check if examType exists before dispatching
      this.store.dispatch(
        downloadReportActions.downloadReport({
          name,
          num,
          year,
          // Re-evaluate if you need `examType` if you already have it from `report.report.examType`
          // If the action expects `ExamType`, ensure 'examType' from 'report.report' is that type.
          examType: examType, // Explicit cast if necessary
          studentNumber: this.report.studentNumber, // Use this.report.studentNumber from the top level
        })
      );
    } else {
      console.warn('Cannot download report: ExamType is missing.');
    }
  }
}
