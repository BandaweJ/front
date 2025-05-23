import { FeesModel } from '../models/fees.model';
import { createReducer, on } from '@ngrx/store';
import {
  balancesActions,
  billingActions,
  billStudentActions,
  feesActions,
  invoiceActions,
  isNewComerActions,
} from './finance.actions';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { InvoiceStatsModel } from '../models/invoice-stats.model';

export interface State {
  fees: FeesModel[];
  studentsToBill: EnrolsModel[];
  isLoading: boolean;
  errorMessage: string;
  selectedStudentInvoice: InvoiceModel;
  balance: BalancesModel | null;
  isNewComer: boolean;
  invoiceStats: InvoiceStatsModel[];
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
    invoiceDate: new Date(),
    invoiceDueDate: new Date(),
  },
  balance: null,
  isNewComer: false,
  invoiceStats: [],
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
      invoiceDate: new Date(),
      invoiceDueDate: new Date(),
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
      invoiceDate: new Date(),
      invoiceDueDate: new Date(),
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
  on(billStudentActions.billStudent, (state, { bills }) => {
    // Combine the existing bills with the new bills
    const updatedBills = [
      ...(state.selectedStudentInvoice?.bills || []),
      ...bills,
    ];
    // Calculate the new totalBill from the bills array
    const newTotalBill = updatedBills.reduce(
      (sum, bill) => sum + +bill.fees.amount,
      0
    );
    // console.log(newTotalBill);

    // Calculate the new balance
    const currentBalanceBfwdAmount =
      state.selectedStudentInvoice?.balanceBfwd?.amount || 0;
    const currentTotalPayments =
      state.selectedStudentInvoice?.totalPayments || 0;

    const newBalance =
      Number(newTotalBill) +
      Number(currentBalanceBfwdAmount) -
      +currentTotalPayments;

    console.log(newBalance);

    return {
      ...state,
      isLoading: false, // Corrected to false on success
      errorMessage: '',
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: [...updatedBills],
        totalBill: newTotalBill, // Update totalBill with the calculated value
        balance: newBalance, // Update balance with the calculated value
      },
    };
  }),
  on(billStudentActions.billStudentSuccess, (state, { bills }) => {
    // Calculate the new totalBill from the bills array
    const newTotalBill = bills.reduce((sum, bill) => sum + bill.fees.amount, 0);

    // Calculate the new balance
    const currentBalanceBfwdAmount =
      state.selectedStudentInvoice?.balanceBfwd?.amount || 0;
    const currentTotalPayments =
      state.selectedStudentInvoice?.totalPayments || 0;

    const newBalance =
      state.selectedStudentInvoice?.balance +
      Number(newTotalBill) +
      Number(currentBalanceBfwdAmount) -
      currentTotalPayments;

    return {
      ...state,
      isLoading: false, // Corrected to false on success
      errorMessage: '',
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: [...state.selectedStudentInvoice.bills, ...bills],
        totalBill: newTotalBill, // Update totalBill with the calculated value
        balance: newBalance, // Update balance with the calculated value
      },
    };
  }),
  on(billStudentActions.billStudentFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    selectedStudentInvoice: {
      ...state.selectedStudentInvoice,
      bills: [],
    },
  })),
  on(billStudentActions.removeBillSuccess, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(billStudentActions.removeBill, (state, { bill }) => {
    const updatedTotalBill =
      state.selectedStudentInvoice.totalBill - bill.fees.amount;
    const currentBalanceBfwdAmount = Number(
      state.selectedStudentInvoice?.balanceBfwd?.amount || 0
    );
    const currentTotalPayments = Number(
      state.selectedStudentInvoice?.totalPayments || 0
    );
    const updatedBalance =
      updatedTotalBill + currentBalanceBfwdAmount - currentTotalPayments;

    return {
      ...state,
      isLoading: false,
      errorMessage: '',
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: state.selectedStudentInvoice.bills.filter(
          (b) => b.id !== bill.id
        ),
        totalBill: updatedTotalBill, // Use the updated totalBill
        balance: updatedBalance, // Use the recalculated balance
      },
    };
  }),
  on(billStudentActions.removeBillFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(invoiceActions.downloadInvoice, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.downloadInvoiceSuccess, (state) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
  })),
  on(invoiceActions.downloadInvoiceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(invoiceActions.saveInvoice, (state) => ({
    ...state,

    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.saveInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    selectedStudentInvoice: invoice,
    isLoading: false,
    errorMessage: '',
  })),
  on(invoiceActions.saveInvoiceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.error.message,
  })),
  on(invoiceActions.fetchInvoiceStats, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    invoiceStats: [],
  })),
  on(invoiceActions.fetchInvoiceStatsSuccess, (state, { invoiceStats }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    invoiceStats,
  })),
  on(invoiceActions.fetchInvoiceStatsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    invoiceStats: [],
  }))
);
