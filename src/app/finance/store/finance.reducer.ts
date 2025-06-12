import { FeesModel } from '../models/fees.model';
import { createReducer, on } from '@ngrx/store';
import {
  balancesActions,
  billingActions,
  billStudentActions,
  feesActions,
  invoiceActions,
  isNewComerActions,
  receiptActions,
} from './finance.actions';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { InvoiceStatsModel } from '../models/invoice-stats.model';
import { ReceiptModel } from '../models/payment.model';

export interface State {
  fees: FeesModel[];
  studentsToBill: EnrolsModel[];
  isLoading: boolean;
  errorMessage: string;
  selectedStudentInvoice: InvoiceModel;
  fetchInvoiceError: string;
  balance: BalancesModel | null;
  isNewComer: boolean;
  invoiceStats: InvoiceStatsModel[];
  termInvoices: InvoiceModel[];
  allInvoices: InvoiceModel[];
  receipts: ReceiptModel[];
  studentOutstandingBalance: number;
  createdReceipt: ReceiptModel;
  isLoadingStudentBalance: boolean;
}

export const initialState: State = {
  fees: [],
  studentsToBill: [],
  isLoading: false,
  errorMessage: '',
  selectedStudentInvoice: {} as InvoiceModel,
  fetchInvoiceError: '',
  balance: null,
  isNewComer: false,
  invoiceStats: [],
  termInvoices: [],
  allInvoices: [],
  receipts: [],
  studentOutstandingBalance: 0,
  createdReceipt: {} as ReceiptModel,
  isLoadingStudentBalance: false,
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
    fetchInvoiceError: '',
    // errorMessage: '',
    selectedStudentInvoice: {} as InvoiceModel,
  })),
  on(invoiceActions.fetchInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    isLoading: false,
    fetchInvoiceError: '',
    // errorMessage: '',
    selectedStudentInvoice: invoice,
  })),
  on(invoiceActions.fetchInvoiceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    // errorMessage: error.message,
    fetchInvoiceError: error.message,
    selectedStudentInvoice: {} as InvoiceModel,
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

    // include balanceBfwd in totalBill
    const currentBalanceBfwdAmount =
      +state.selectedStudentInvoice?.balanceBfwd?.amount || 0;

    const newTotal = Number(newTotalBill) + Number(currentBalanceBfwdAmount);

    // console.log(newBalance);

    return {
      ...state,
      isLoading: false, // Corrected to false on success
      errorMessage: '',
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: [...updatedBills],
        totalBill: newTotal, // Update totalBill with the calculated value
      },
    };
  }),
  on(billStudentActions.billStudentSuccess, (state, { bills }) => {
    // Calculate the new totalBill from the bills array
    const newTotalBill = bills.reduce((sum, bill) => sum + bill.fees.amount, 0);

    // Calculate the new balance
    const currentBalanceBfwdAmount =
      +state.selectedStudentInvoice?.balanceBfwd?.amount || 0;

    const newTotal =
      +state.selectedStudentInvoice?.balance +
      Number(newTotalBill) +
      Number(currentBalanceBfwdAmount);

    return {
      ...state,
      isLoading: false, // Corrected to false on success
      errorMessage: '',
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: [...state.selectedStudentInvoice.bills, ...bills],
        totalBill: newTotal, // Update totalBill with the calculated value
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
      +state.selectedStudentInvoice.totalBill - +bill.fees.amount;
    const currentBalanceBfwdAmount = Number(
      +state.selectedStudentInvoice?.balanceBfwd?.amount || 0
    );

    const updatedTotal = +updatedTotalBill + +currentBalanceBfwdAmount;

    return {
      ...state,
      isLoading: false,
      errorMessage: '',
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: state.selectedStudentInvoice.bills.filter(
          (b) => b.id !== bill.id
        ),
        totalBill: updatedTotal, // Use the updated totalBill
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
  })),
  on(invoiceActions.fetchInvoices, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.fetchInvoicesSuccess, (state, { invoices }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    termInvoices: [...invoices],
  })),
  on(invoiceActions.fetchInvoicesFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.fetchReceipts, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.fetchReceiptsSuccess, (state, { receipts }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    receipts,
  })),
  on(receiptActions.fetchReceiptsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.saveReceipt, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.saveReceiptSuccess, (state, { receipt }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    createdReceipt: receipt,
    receipts: [...state.receipts, receipt],
  })),
  on(receiptActions.saveReceiptFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.downloadReceiptPdf, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.downloadReceiptPdfSuccess, (state) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
  })),
  on(receiptActions.downloadReceiptPdfFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.fetchStudentOutstandingBalance, (state) => ({
    ...state,

    isLoadingStudentBalance: true,
    errorMessage: '',
  })),
  on(
    receiptActions.fetchStudentOutstandingBalanceSuccess,
    (state, { amountDue }) => ({
      ...state,

      isLoadingStudentBalance: false,
      errorMessage: '',
      studentOutstandingBalance: amountDue,
    })
  ),
  on(receiptActions.fetchStudentOutstandingBalanceFail, (state, { error }) => ({
    ...state,

    isLoadingStudentBalance: false,
    errorMessage: error.message,
  })),
  on(receiptActions.clearStudentFinancials, (state) => ({
    ...state,
    studentOutstandingBalance: 0, // Reset balance
    createdReceipt: {} as ReceiptModel, // Reset created receipt
    // You might also want to reset isLoading and errorMessage if they are tied specifically to the dialog/financial flow
    isLoading: false,
    errorMessage: '',
  })),
  on(receiptActions.clearCreatedReceipt, (state) => ({
    ...state,
    createdReceipt: {} as ReceiptModel,
  }))
);
