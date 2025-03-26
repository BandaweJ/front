import { FeesModel } from '../models/fees.model';
import { isLoading } from '../../auth/store/auth.selectors';
import { createReducer, on } from '@ngrx/store';
import { feesActions } from './finance.actions';

export interface State {
  fees: FeesModel[];
  isLoading: boolean;
  errorMessage: string;
}

export const initialState: State = {
  fees: [],
  isLoading: false,
  errorMessage: '',
};

export const financeReducer = createReducer(
  initialState,
  on(feesActions.fetchFees, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(feesActions.fetchFeesSuccess, (state, { fees }) => ({
    ...state,
    fees: fees,
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.fetchFeesFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(feesActions.addFee, (state, { fee }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(feesActions.addFeeSuccess, (state, { fee }) => ({
    ...state,
    fees: [...state.fees, fee],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.addFeeFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(feesActions.editFee, (state, { fee }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(feesActions.editFeeSuccess, (state, { fee }) => ({
    ...state,
    fees: [...state.fees.map((f) => (f.id == fee.id ? (f = fee) : (f = f)))],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.editFeeFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(feesActions.deleteFee, (state, { id }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(feesActions.deleteFeeSuccess, (state, { fee }) => ({
    ...state,
    fees: [...state.fees.filter((f) => f.id != fee.id)],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.deleteFeeFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  }))
);
