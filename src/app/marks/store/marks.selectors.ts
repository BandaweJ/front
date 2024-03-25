import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromMarksReducer from './marks.reducer';

export const marksState =
  createFeatureSelector<fromMarksReducer.State>('marks');

export const selectSubjects = createSelector(
  marksState,
  (state: fromMarksReducer.State) => state.subjects
);

export const selectMarksErrorMsg = createSelector(
  marksState,
  (state: fromMarksReducer.State) => state.errorMessage
);

export const selectMarks = createSelector(
  marksState,
  (state: fromMarksReducer.State) => state.marks
);

export const selectPerfData = createSelector(
  marksState,
  (state: fromMarksReducer.State) => state.data
);

export const selectLineChartData = createSelector(
  marksState,
  (state: fromMarksReducer.State) => state.lineChartData
);

export const selectComments = createSelector(
  marksState,
  (state: fromMarksReducer.State) => state.comments
);
