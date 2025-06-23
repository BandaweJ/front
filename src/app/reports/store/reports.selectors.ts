import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReportsReducer from './reports.reducer';

export const reportsState =
  createFeatureSelector<fromReportsReducer.State>('reports');

export const selectReports = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.reports
);

export const selectReportsErrorMsg = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.errorMessage
);

export const selectIsLoading = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.isLoading
);

export const selectStudentReports = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.studentReports
);

export const selectSelectedReport = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.selectedReport
);
