import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAttendanceReducer from './attendance.reducer';

export const attendanceState =
  createFeatureSelector<fromAttendanceReducer.State>('attendance');

export const selectAttendances = createSelector(
  attendanceState,
  (state: fromAttendanceReducer.State) => state.attendances
);

export const selectAllClassAttendances = createSelector(
  attendanceState,
  (state: fromAttendanceReducer.State) => state.allClassAttendances
);
