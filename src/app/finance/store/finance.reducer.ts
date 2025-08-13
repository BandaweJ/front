import { FeesModel } from '../models/fees.model';
import { createReducer, on } from '@ngrx/store';
import {
  balancesActions,
  billingActions,
  billStudentActions,
  exemptionActions,
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
import { ExemptionModel } from '../models/exemption.model';
import { ExemptionType } from '../enums/exemption-type.enum';
import { FeesNames } from '../enums/fees-names.enum';

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

  exemption: ExemptionModel | null;
  exemptionLoading: boolean;
  exemptionError: string | null;
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

  exemption: null,
  exemptionLoading: false,
  exemptionError: null,
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
    const finalBillsForInvoice = bills;

    // 1. Calculate the gross total bill (sum of all bills before any exemption)
    const grossTotalBill = finalBillsForInvoice.reduce(
      (sum, bill) => sum + Number(bill.fees.amount || 0), // Ensure bill.fees.amount is treated as a number
      0
    );

    // 2. Get the exemption from the current selected invoice
    // Safely access exemption, it might be null or undefined if no exemption is applied
    const studentExemption: ExemptionModel | undefined =
      state.selectedStudentInvoice?.exemption;

    // 3. Calculate the net total bill after applying exemption
    let netTotalBillFromBills = grossTotalBill; // This will be the value for invoice.totalBill

    if (studentExemption && studentExemption.isActive) {
      if (
        studentExemption.type === ExemptionType.FIXED_AMOUNT //||
        //studentExemption.type === ExemptionType.STAFF_SIBLING
      ) {
        // Apply fixed amount exemption, ensuring result doesn't go below zero
        netTotalBillFromBills = Math.max(
          0,
          netTotalBillFromBills - (Number(studentExemption.fixedAmount) || 0)
        );
      } else if (studentExemption.type === ExemptionType.PERCENTAGE) {
        // Apply percentage exemption
        const percentage =
          (Number(studentExemption.percentageAmount) || 0) / 100;
        netTotalBillFromBills = Math.max(
          0,
          netTotalBillFromBills * (1 - percentage)
        );
      } else if (studentExemption.type === ExemptionType.STAFF_SIBLING) {
        netTotalBillFromBills = 0;
        bills.map((bill) => {
          if (bill.fees.name === FeesNames.foodFee) {
            netTotalBillFromBills += 100;
          }
        });
      }
      // Round the net total bill to two decimal places for currency
      netTotalBillFromBills = parseFloat(netTotalBillFromBills.toFixed(2));
    }

    // 4. Get other necessary amounts, ensuring they are numbers
    const currentBalanceBfwdAmount = Number(
      state.selectedStudentInvoice?.balanceBfwd?.amount || 0
    );
    const amountPaid = Number(
      state.selectedStudentInvoice?.amountPaidOnInvoice || 0
    );

    // 5. Calculate new balance based on the net total bill, balance brought forward, and payments
    const newBalance =
      netTotalBillFromBills + currentBalanceBfwdAmount - amountPaid;
    // Round the new balance to two decimal places for consistency
    const roundedNewBalance = parseFloat(newBalance.toFixed(2));

    return {
      ...state,
      isLoading: false,
      errorMessage: '',
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: [...finalBillsForInvoice], // Use the new, complete array of bills
        totalBill: netTotalBillFromBills + currentBalanceBfwdAmount, // This now reflects the net sum of current bills after exemption
        balance: roundedNewBalance, // This is the final calculated balance
      },
    };
  }),

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
  on(invoiceActions.saveInvoiceSuccess, (state, { invoice }) => {
    // Check if the invoice already exists in the array
    const existingInvoice = state.allInvoices.find(
      (inv) => inv.invoiceNumber === invoice.invoiceNumber
    );

    let updatedAllInvoices;

    if (existingInvoice) {
      // If the invoice exists, map over the array to replace the old one
      updatedAllInvoices = state.allInvoices.map((inv) =>
        inv.invoiceNumber === invoice.invoiceNumber ? invoice : inv
      );
    } else {
      // If the invoice is new, add it to the end of the array
      updatedAllInvoices = [...state.allInvoices, invoice];
    }

    return {
      ...state,
      selectedStudentInvoice: invoice,
      allInvoices: updatedAllInvoices,
      isLoading: false,
      errorMessage: '',
    };
  }),
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
    // Filter out the old receipt (if it exists) and add the new one
    allReceipts: [
      ...state.allReceipts.filter(
        (r) => r.receiptNumber !== receipt.receiptNumber
      ),
      receipt,
    ],
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
  }),
  // Handle Create Exemption action (start loading)
  on(exemptionActions.createExemption, (state) => ({
    ...state,
    exemptionLoading: true,
    exemptionError: null, // Clear any previous errors
  })),

  // Handle Create Exemption Success action (store exemption, stop loading)
  on(exemptionActions.createExemptionSuccess, (state, { exemption }) => ({
    ...state,
    exemption: exemption, // Store the newly created exemption
    exemptionLoading: false,
    exemptionError: null,
  })),

  // Handle Create Exemption Failure action (store error, stop loading)
  on(exemptionActions.createExemptionFailure, (state, { error }) => ({
    ...state,
    exemptionLoading: false,
    exemptionError: error,
    exemption: null, // Clear exemption on error
  })),
  on(receiptActions.voidReceipt, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.voidReceiptSuccess, (state, { receipt }) => ({
    ...state,
    isLoading: false,
    // Find the receipt in the list and replace it with the updated (voided) version
    allReceipts: state.allReceipts.map((r) =>
      r.id === receipt.id ? receipt : r
    ),
  })),
  on(receiptActions.voidReceiptFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  }))
);
