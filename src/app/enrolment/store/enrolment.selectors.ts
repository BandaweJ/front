import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromEnrolmentReducer from './enrolment.reducer';

export const enrolmentState =
  createFeatureSelector<fromEnrolmentReducer.State>('enrol');

export const selectClasses = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.classes
);

export const selectEnrolErrorMsg = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.errorMessage
);

// export const selectDeleteSuccess = createSelector(
//   enrolmentState,
//   (state: fromEnrolmentReducer.State) => state.deleteSuccess
// );

// export const selectAddSuccess = createSelector(
//   enrolmentState,
//   (state: fromEnrolmentReducer.State) => state.addSuccess
// );

export const selectTerms = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.terms
);

export const selectEnrols = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.enrols
);

export const selectEnrolsStats = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.enrolStats
);

export const selectMigrateClassResult = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.migrateClassResult
);
