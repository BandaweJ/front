import { createReducer, on } from '@ngrx/store';
import { ReportsModel } from '../models/reports.model';
import * as reportsActions from './reports.actions';
import { ReportModel } from '../models/report.model';

export interface State {
  reports: ReportsModel[];
  isLoading: boolean;
  errorMessage: string;
}

export const initialState: State = {
  reports: [],
  isLoading: false,
  errorMessage: '',
};

export const reportsReducer = createReducer(
  initialState,
  on(reportsActions.generateReports, (state, { name, num, year }) => ({
    ...state,
    isLoading: true,
  })),
  on(reportsActions.generateReportsSuccess, (state, { reports }) => ({
    ...state,
    reports,
    isLoading: false,
  })),
  on(reportsActions.generateReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(reportsActions.saveReportActions.saveReports, (state, { reports }) => ({
    ...state,
    isLoading: true,
    reports: [],
  })),
  on(
    reportsActions.saveReportActions.saveReportsSuccess,
    (state, { reports }) => ({
      ...state,
      isLoading: false,
      reports: [...reports],
    })
  ),
  on(reportsActions.saveReportActions.saveReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(
    reportsActions.viewReportsActions.viewReports,
    (state, { name, num, year }) => ({
      ...state,
      isLoading: true,
      reports: [],
    })
  ),
  on(
    reportsActions.viewReportsActions.viewReportsSuccess,
    (state, { reports }) => ({
      ...state,
      isLoading: false,
      reports: [...reports],
    })
  ),
  on(reportsActions.viewReportsActions.viewReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    reports: [],
  })),
  on(
    reportsActions.saveHeadCommentActions.saveHeadComment,
    (state, { comment }) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    reportsActions.saveHeadCommentActions.saveHeadCommentSuccess,
    (state, { report }) => ({
      ...state,
      isLoading: false,
      reports: [
        ...state.reports.map((rep) =>
          rep.studentNumber === report.studentNumber
            ? (rep = report)
            : (rep = rep)
        ),
      ],
    })
  ),
  on(
    reportsActions.saveHeadCommentActions.saveHeadCommentFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  )
  // on(reportsActions.saveHeadCommentActions.saveHeadCommentSuccess, (state))
);
