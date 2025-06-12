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

export const selectedStudentInvoice = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.selectedStudentInvoice
);

export const selectIsNewComer = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.isNewComer
);

export const selectInVoiceStats = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.invoiceStats
);

export const selectInVoices = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.termInvoices
);

export const selectCreatedReceipt = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.createdReceipt
);

export const selectAmountDue = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.studentOutstandingBalance
);

export const selectReceipts = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.receipts
);

export const selectIsLoadingFinancials = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.isLoadingStudentBalance
);

export const selectFechInvoiceError = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.fetchInvoiceError
);
