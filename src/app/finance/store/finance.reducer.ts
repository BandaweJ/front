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
import { InvoiceStatsModel } from '../models/invoice-stats.model';
import { ReceiptModel } from '../models/payment.model';

export interface State {
  fees: FeesModel[];
  studentsToBill: EnrolsModel[];
  isLoading: boolean;
  errorMessage: string;
  selectedStudentInvoice: InvoiceModel;
  fetchInvoiceError: string;
  generateEmptyInvoiceErr: string;
  balance: BalancesModel | null;
  isNewComer: boolean;
  invoiceStats: InvoiceStatsModel[];
  termInvoices: InvoiceModel[];
  allInvoices: InvoiceModel[];
  allReceipts: ReceiptModel[];
  studentOutstandingBalance: number;
  createdReceipt: ReceiptModel;
  isLoadingStudentBalance: boolean;

  studentInvoices: InvoiceModel[];
  loadingStudentInvoices: boolean;
  loadStudentReceiptsErr: string;
  studentReceipts: ReceiptModel[];
  loadingStudentReceipts: boolean;
  loadStudentInvoicesErr: string;
}

export const initialState: State = {
  fees: [],
  studentsToBill: [],
  isLoading: false,
  errorMessage: '',
  selectedStudentInvoice: {} as InvoiceModel,
  fetchInvoiceError: '',
  generateEmptyInvoiceErr: '',
  balance: null,
  isNewComer: false,
  invoiceStats: [],
  termInvoices: [],
  allInvoices: [],
  allReceipts: [],
  studentOutstandingBalance: 0,
  createdReceipt: {} as ReceiptModel,
  isLoadingStudentBalance: false,

  studentInvoices: [],
  loadingStudentInvoices: false,
  loadStudentInvoicesErr: '',
  studentReceipts: [],
  loadingStudentReceipts: false,
  loadStudentReceiptsErr: '',
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
    // The 'bills' array coming from the action (which is your component's 'toBill')
    // should already contain the *final, desired set* of bills for the invoice.
    // So, we replace the existing bills with these new ones.
    const finalBillsForInvoice = bills;

    // Calculate the new totalBill from this final set of bills
    const newTotalBill = finalBillsForInvoice.reduce(
      (sum, bill) => sum + +bill.fees.amount,
      0
    );

    // Include balanceBfwd in totalBill
    const currentBalanceBfwdAmount =
      +state.selectedStudentInvoice?.balanceBfwd?.amount || 0;

    const newTotal = Number(newTotalBill) + Number(currentBalanceBfwdAmount);

    const newBalance =
      newTotal - state.selectedStudentInvoice.amountPaidOnInvoice;

    return {
      ...state,
      isLoading: false, // Assuming these are part of your state management for the billing process
      errorMessage: '', // Assuming these are part of your state management for the billing process
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: [...finalBillsForInvoice], // Use the new, complete array of bills
        totalBill: newTotal, // Update totalBill with the calculated value
        balance: newBalance,
        // Note: Other invoice fields like 'balance', 'amountPaidOnInvoice', 'status'
        // might also need to be recalculated or updated depending on your business logic
        // and if this action triggers a payment recalculation or status change.
        // For now, only 'bills' and 'totalBill' are directly addressed as per your request.
      },
    };
  }),

  // on(billStudentActions.removeBillSuccess, (state) => ({
  //   ...state,
  //   isLoading: true,
  //   errorMessage: '',
  // })),
  // on(billStudentActions.removeBill, (state, { bill }) => {
  //   const updatedTotalBill =
  //     +state.selectedStudentInvoice.totalBill - +bill.fees.amount;
  //   const currentBalanceBfwdAmount = Number(
  //     +state.selectedStudentInvoice?.balanceBfwd?.amount || 0
  //   );

  //   const updatedTotal = +updatedTotalBill + +currentBalanceBfwdAmount;

  //   return {
  //     ...state,
  //     isLoading: false,
  //     errorMessage: '',
  //     selectedStudentInvoice: {
  //       ...state.selectedStudentInvoice,
  //       bills: state.selectedStudentInvoice.bills.filter(
  //         (b) => b.id !== bill.id
  //       ),
  //       totalBill: updatedTotal, // Use the updated totalBill
  //     },
  //   };
  // }),
  // on(billStudentActions.removeBillFail, (state, { error }) => ({
  //   ...state,
  //   isLoading: false,
  //   errorMessage: error.message,
  // })),
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
  on(invoiceActions.fetchTermInvoices, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.fetchTermInvoicesSuccess, (state, { invoices }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    termInvoices: [...invoices],
  })),
  on(invoiceActions.fetchTermInvoicesFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(invoiceActions.fetchAllInvoices, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.fetchAllInvoicesSuccess, (state, { allInvoices }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    allInvoices: allInvoices,
  })),
  on(invoiceActions.fetchAllInvoicesFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.fetchAllReceipts, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.fetchAllReceiptsSuccess, (state, { allReceipts }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    allReceipts: allReceipts,
  })),
  on(receiptActions.fetchAllReceiptsFail, (state, { error }) => ({
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
    allReceipts: [...state.allReceipts, receipt],
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
  })),
  on(receiptActions.fetchStudentReceipts, (state) => ({
    ...state,
    loadingStudentReceipts: true,
    loadStudentReceiptsErr: '',
  })),
  on(
    receiptActions.fetchStudentReceiptsSuccess,
    (state, { studentReceipts }) => ({
      ...state,
      studentReceipts,
      loadingStudentReceipts: false,
    })
  ),
  on(receiptActions.fetchStudentReceiptsFail, (state, { error }) => ({
    ...state,
    loadingStudentReceipts: false,
    loadStudentReceiptsErr: error.message,
  })),
  on(invoiceActions.fetchStudentInvoices, (state) => ({
    ...state,
    loadingStudentInvoices: true,
    loadStudentInvoiceErr: '',
  })),
  on(
    invoiceActions.fetchStudentInvoicesSuccess,
    (state, { studentInvoices }) => ({
      ...state,
      studentInvoices,
      loadingStudentInvoices: false,
    })
  ),
  on(invoiceActions.fetchStudentInvoicesFail, (state, { error }) => ({
    ...state,
    loadingStudentInvoices: false,
    loadStudentInvoicesErr: error.message,
  })),
  on(invoiceActions.updateInvoiceEnrolment, (state, { enrol }) => {
    // Only update if an invoice currently exists
    if (state.selectedStudentInvoice) {
      return {
        ...state,
        selectedStudentInvoice: {
          ...state.selectedStudentInvoice,
          enrol: { ...enrol }, // Create a new enrol object to ensure immutability
        },
      };
    }
    return state; // If no invoice, do nothing
  })
);
