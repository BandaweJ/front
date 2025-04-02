import { FeesModel } from '../models/fees.model';
import { isLoading } from '../../auth/store/auth.selectors';
import { createReducer, on } from '@ngrx/store';
import { billingActions, feesActions } from './finance.actions';
import { StudentsModel } from 'src/app/registration/models/students.model';

export interface State {
  fees: FeesModel[];
  studentsToBill: StudentsModel[];
  isLoading: boolean;
  errorMessage: string;
}

export const initialState: State = {
  fees: [],
  studentsToBill: [],
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
    fees: [...fees],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.fetchFeesFail, (state, { error }) => ({
    ...state,
    fees: [],
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
    // fees: [...state.fees.map((f) => (f.id == fee.id ? (f = fee) : (f = f)))],
    fees: [...state.fees.map((f) => (f.id === fee.id ? { ...fee } : f))],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.editFeeFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(billingActions.fetchStudentsToBill, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    studentsToBill: [],
  })),
  on(
    billingActions.fetchStudentsToBillSuccess,
    (state, { studentsToBill }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
      studentsToBill,
    })
  ),
  on(billingActions.fetchStudentsToBillFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    studentsToBill: [],
  }))

  // on(feesActions.deleteFee, (state, { id }) => ({
  //   ...state,
  //   isLoading: true,
  //   errorMessage: '',
  // })),
  // on(feesActions.deleteFeeSuccess, (state, { id }) => ({
  //   ...state,
  //   fees: [...state.fees.filter((f) => f.id != id)],
  //   isLoading: false,
  //   errorMessage: '',
  // })),
  // on(feesActions.deleteFeeFail, (state, { error }) => ({
  //   ...state,
  //   isLoading: false,
  //   errorMessage: error.message,
  // }))
);
