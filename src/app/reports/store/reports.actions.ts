import {
  createAction,
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { ReportsModel } from '../models/reports.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportModel } from '../models/report.model';
import { HeadCommentModel } from '../models/comment.model';
import { ExamType } from 'src/app/marks/models/examtype.enum';

export const generateReports = createAction(
  '[Reports Component] generate reports',
  props<{ name: string; num: number; year: number; examType: ExamType }>()
);

export const generateReportsSuccess = createAction(
  '[Reports Component] generate reports success',
  props<{ reports: ReportsModel[] }>()
);

export const generateReportsFail = createAction(
  '[Reports Component] generate reports fail',
  props<{ error: HttpErrorResponse }>()
);

export const saveReportActions = createActionGroup({
  source: 'Reports Component',
  events: {
    saveReports: props<{
      name: string;
      num: number;
      year: number;
      reports: ReportsModel[];
    }>(),
    saveReportsSuccess: props<{ reports: ReportsModel[] }>(),
    saveReportsFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const viewReportsActions = createActionGroup({
  source: 'Reports Component',
  events: {
    viewReports: props<{ name: string; num: number; year: number }>(),
    viewReportsSuccess: props<{ reports: ReportsModel[] }>(),
    viewReportsFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const saveHeadCommentActions = createActionGroup({
  source: 'Report Component',
  events: {
    saveHeadComment: props<{ comment: HeadCommentModel }>(),
    saveHeadCommentSuccess: props<{ report: ReportsModel }>(),
    saveHeadCommentFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const downloadReportActions = createActionGroup({
  source: 'Reports Component',
  events: {
    downloadReport: props<{
      reportsModel: ReportsModel;
    }>(),
    downloadReportSuccess: emptyProps(),
    downloadReportFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const generatePdfActions = createActionGroup({
  source: 'Report Component',
  events: {
    generatePdf: emptyProps(),
    generatePdfSuccess: emptyProps(),
  },
});
