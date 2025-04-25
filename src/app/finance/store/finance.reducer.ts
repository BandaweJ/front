import { FeesModel } from '../models/fees.model';
import { isLoading } from '../../auth/store/auth.selectors';
import { createReducer, on } from '@ngrx/store';
import {
  balancesActions,
  billingActions,
  billStudentAction,
  feesActions,
  invoiceActions,
  isNewComerActions,
} from './finance.actions';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';
import { StudentsModel } from 'src/app/registration/models/students.model';

export interface State {
  fees: FeesModel[];
  studentsToBill: EnrolsModel[];
  isLoading: boolean;
  errorMessage: string;
  selectedStudentInvoice: InvoiceModel;
  balance: BalancesModel | null;
  isNewComer: boolean;
}

export const initialState: State = {
  fees: [],
  studentsToBill: [],
  isLoading: false,
  errorMessage: '',
  selectedStudentInvoice: {
    totalBill: 0, // Provide a default value (or calculate if possible at this stage)
    totalPayments: 0, // Provide a default value
    balanceBfwd: {} as BalancesModel, // Provide an initial empty object or a default BalancesModel
    student: {} as StudentsModel, // Provide an initial empty object or handle based on your logic
    bills: [],
    payments: [], // Initialize payments array
    balance: 0, // Provide a default value
  },
  balance: null,
  isNewComer: false,
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
  })),
  on(invoiceActions.fetchInvoice, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    selectedStudentInvoice: {
      totalBill: 0, // Provide a default value (or calculate if possible at this stage)
      totalPayments: 0, // Provide a default value
      balanceBfwd: {} as BalancesModel, // Provide an initial empty object or a default BalancesModel
      student: {} as StudentsModel, // Provide an initial empty object or handle based on your logic
      bills: [],
      payments: [], // Initialize payments array
      balance: 0, // Provide a default value
    },
  })),
  on(invoiceActions.fetchInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    selectedStudentInvoice: invoice,
  })),
  on(invoiceActions.fetchInvoiceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    selectedStudentInvoice: {
      totalBill: 0, // Provide a default value (or calculate if possible at this stage)
      totalPayments: 0, // Provide a default value
      balanceBfwd: {} as BalancesModel, // Provide an initial empty object or a default BalancesModel
      student: {} as StudentsModel, // Provide an initial empty object or handle based on your logic
      bills: [],
      payments: [], // Initialize payments array
      balance: 0, // Provide a default value
    },
  })),
  on(balancesActions.saveBalance, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    balance: null,
  })),
  on(balancesActions.saveBalanceSuccess, (state, { balance }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    balance,
  })),
  on(balancesActions.saveBalanceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    balance: null,
  })),
  on(isNewComerActions.checkIsNewComer, (state) => ({
    ...state,
    isNewComer: false,
    isLoading: true,
    errorMessage: '',
  })),
  on(isNewComerActions.checkIsNewComerSuccess, (state, { isNewComer }) => ({
    ...state,
    isLoading: false,
    isNewComer,
    errorMessage: '',
  })),
  on(isNewComerActions.checkIsNewComerFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    isNewComer: false,
    errorMessage: error.message,
  })),
  on(billStudentAction.billStudent, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    selectedStudentInvoice: {
      ...state.selectedStudentInvoice,
      bills: [],
    },
  })),
  on(billStudentAction.billStudentSuccess, (state, { bills }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    selectedStudentInvoice: {
      ...state.selectedStudentInvoice,
      bills,
    },
  })),
  on(billStudentAction.billStudentFail, (state, { error }) => ({
    ...state,
    isLoading: true,
    errorMessage: error.message,
    selectedStudentInvoice: {
      ...state.selectedStudentInvoice,
      bills: [],
    },
  }))
);
