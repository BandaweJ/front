import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFinanceReducer from './finance.reducer';
export const financeState =
  createFeatureSelector<fromFinanceReducer.State>('finance');

export const selectFees = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.fees
);

export const selectIsLoading = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.isLoading
);

export const selectErrorMsg = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.errorMessage
);

export const selectStudentsToBill = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.studentsToBill
);
