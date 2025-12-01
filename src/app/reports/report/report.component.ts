import { Component, Input, OnInit } from '@angular/core'; // No OnDestroy needed here if no subscriptions are kept
import { ReportsModel } from '../models/reports.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  downloadReportActions,
  saveHeadCommentActions,
  saveTeacherCommentActions,
} from '../store/reports.actions';

import { HeadCommentModel, TeacherCommentModel } from '../models/comment.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';

import { selectIsLoading } from '../store/reports.selectors';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { Subscription, combineLatest } from 'rxjs'; // Import Subscription
import { map } from 'rxjs/operators';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';

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
  teacherEditState = false;
  role = ''; // Initialize role
  isLoading$ = this.store.select(selectIsLoading);
  studentNumber = '';
  
  // Permission-based access observables
  canDownloadReport$ = this.roleAccess.canDownloadReport$();
  canEditComment$ = this.roleAccess.canEditReportComment$();
  isStudent$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.student, role))
  );
  
  // Combined observables for template use
  canEditCommentAndNotStudent$ = combineLatest([
    this.isStudent$,
    this.canEditComment$
  ]).pipe(
    map(([isStudent, canEdit]) => !isStudent && canEdit)
  );

  // Check if report is saved (has an ID)
  get isReportSaved(): boolean {
    return !!this.report?.id;
  }

  // Check if comments can be edited (report must be saved)
  get canEditComments(): boolean {
    return this.isReportSaved;
  }

  private userSubscription: Subscription | undefined; // Declare subscription

  constructor(
    private store: Store,
    private roleAccess: RoleAccessService
  ) {}

  commentForm!: FormGroup;
  teacherCommentControl: FormControl = new FormControl('');

  ngOnInit(): void {
    this.commentForm = new FormGroup({
      comment: new FormControl(this.report.report.headComment, [
        Validators.required,
      ]),
    });

    // initialise teacher comment control from report
    this.teacherCommentControl = new FormControl(
      this.report.report.classTrComment || '',
      []
    );
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

  get teacherComment() {
    return this.teacherCommentControl;
  }

  saveComment() {
    // Check if report is saved first
    if (!this.isReportSaved) {
      console.warn('Cannot save comment: Report must be saved first', {
        reportId: this.report?.id,
        hasReport: !!this.report,
      });
      return;
    }

    if (this.comment?.valid) {
      // Ensure we have a valid report with all required properties
      if (!this.report || !this.report.report) {
        console.error('Cannot save head comment: Report data is incomplete', {
          hasReport: !!this.report,
          hasReportReport: !!(this.report?.report),
          report: this.report,
        });
        return;
      }

      const comm: string = this.comment.value;

      // Explicitly construct the report object with all necessary properties
      const fullReport: ReportsModel = {
        id: this.report.id,
        num: this.report.num,
        year: this.report.year,
        name: this.report.name,
        studentNumber: this.report.studentNumber,
        report: {
          ...this.report.report, // Spread existing report.report properties
          headComment: comm, // Update the specific comment
        },
        examType: this.report.examType,
      };

      const comment: HeadCommentModel = {
        comment: comm,
        report: fullReport,
      };

      console.log('Saving head comment with report:', comment);

      this.store.dispatch(saveHeadCommentActions.saveHeadComment({ comment }));
      this.toggleEditState(); // Toggle state after dispatching
    }
  }

  // Save teacher / class comment directly on the report
  saveTeacherComment() {
    // Check if report is saved first
    if (!this.isReportSaved) {
      console.warn('Cannot save comment: Report must be saved first');
      return;
    }

    if (this.teacherComment?.valid) {
      const comm: string = this.teacherComment.value;

      // Ensure we have a valid report with all required properties
      if (!this.report || !this.report.report) {
        console.error('Cannot save teacher comment: Report data is incomplete', {
          hasReport: !!this.report,
          hasReportReport: !!(this.report?.report),
          report: this.report,
        });
        return;
      }

      const comment: TeacherCommentModel = {
        comment: comm,
        report: {
          id: this.report.id,
          num: this.report.num,
          year: this.report.year,
          name: this.report.name,
          studentNumber: this.report.studentNumber,
          examType: this.report.examType,
          report: this.report.report, // Ensure the nested report is included
        },
      };

      console.log('Saving teacher comment with report:', comment);

      this.store.dispatch(
        saveTeacherCommentActions.saveTeacherComment({ comment })
      );
      this.toggleTeacherEditState();
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
    // Check if report is saved first
    if (!this.isReportSaved) {
      console.warn('Cannot download: Report must be saved first');
      return;
    }

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

  toggleTeacherEditState() {
    this.teacherEditState = !this.teacherEditState;
    if (this.teacherEditState) {
      this.teacherCommentControl.setValue(
        this.report.report.classTrComment || ''
      );
    }
  }
}
