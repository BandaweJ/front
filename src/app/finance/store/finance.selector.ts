import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFinanceReducer from './finance.reducer';
export const financeState =
  createFeatureSelector<fromFinanceReducer.State>('finance');

export const selectFees = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.fees
);
