// src/app/finance/store/finance.actions.ts

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FeesModel } from '../models/fees.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentsModel } from 'src/app/registration/models/students.model'; // Assuming this path is correct
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model'; // Assuming this path is correct
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';
import { BillModel } from '../models/bill.model';
import { InvoiceStatsModel } from '../models/invoice-stats.model';
import { ReceiptModel } from '../models/payment.model';
import { PaymentMethods } from '../enums/payment-methods.enum';
import { ExemptionModel } from '../models/exemption.model';

export const feesActions = createActionGroup({
  source: 'Fees Component',
  events: {
    fetchFees: emptyProps(),
    fetchFeesSuccess: props<{ fees: FeesModel[] }>(),
    fetchFeesFail: props<{ error: HttpErrorResponse }>(),
    addFee: props<{ fee: FeesModel }>(),
    addFeeSuccess: props<{ fee: FeesModel }>(),
    addFeeFail: props<{ error: HttpErrorResponse }>(),
    editFee: props<{ id: number; fee: FeesModel }>(),
    editFeeSuccess: props<{ fee: FeesModel }>(),
    editFeeFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const billingActions = createActionGroup({
  source: 'Student Finance Component',
  events: {
    fetchStudentsToBill: props<{ num: number; year: number }>(),
    fetchStudentsToBillSuccess: props<{ studentsToBill: EnrolsModel[] }>(),
    fetchStudentsToBillFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const invoiceActions = createActionGroup({
  source: 'Student Finance Component',
  events: {
    fetchInvoice: props<{ studentNumber: string; num: number; year: number }>(),
    fetchInvoiceSuccess: props<{ invoice: InvoiceModel }>(),
    fetchInvoiceFail: props<{ error: HttpErrorResponse }>(),

    // --- AMENDED downloadInvoice action ---
    downloadInvoice: props<{ invoiceNumber: string }>(), // Only needs invoiceNumber
    downloadInvoiceSuccess: props<{ fileName: string }>(), // Pass filename for clarity/feedback
    downloadInvoiceFail: props<{ error: HttpErrorResponse }>(),

    saveInvoice: props<{ invoice: InvoiceModel }>(),
    saveInvoiceSuccess: props<{ invoice: InvoiceModel }>(),
    saveInvoiceFail: props<{ error: HttpErrorResponse }>(),

    fetchInvoiceStats: props<{ num: number; year: number }>(),
    fetchInvoiceStatsSuccess: props<{ invoiceStats: InvoiceStatsModel[] }>(),
    fetchInvoiceStatsFail: props<{ error: HttpErrorResponse }>(),

    fetchTermInvoices: props<{ num: number; year: number }>(), //invoices for a term
    fetchTermInvoicesSuccess: props<{ invoices: InvoiceModel[] }>(),
    fetchTermInvoicesFail: props<{ error: HttpErrorResponse }>(),

    fetchAllInvoices: emptyProps(),
    fetchAllInvoicesSuccess: props<{ allInvoices: InvoiceModel[] }>(),
    fetchAllInvoicesFail: props<{ error: HttpErrorResponse }>(),

    fetchStudentInvoices: props<{ studentNumber: string }>(),
    fetchStudentInvoicesSuccess: props<{ studentInvoices: InvoiceModel[] }>(),
    fetchStudentInvoicesFail: props<{ error: HttpErrorResponse }>(),

    updateInvoiceEnrolment: props<{ enrol: EnrolsModel }>(),
    clearInvoice: emptyProps(), // Add a clear action for when selection changes
  },
});

export const balancesActions = createActionGroup({
  source: 'Balances Component',
  events: {
    saveBalance: props<{ balance: BalancesModel }>(),
    saveBalanceSuccess: props<{ balance: BalancesModel }>(),
    saveBalanceFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const isNewComerActions = createActionGroup({
  source: 'Invoice Component',
  events: {
    checkIsNewComer: props<{ studentNumber: string }>(),
    checkIsNewComerSuccess: props<{ isNewComer: boolean }>(),
    checkIsNewComerFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const billStudentActions = createActionGroup({
  source: 'Bill Component',
  events: {
    billStudent: props<{ bills: BillModel[] }>(),
    billStudentSuccess: props<{ bills: BillModel[] }>(),
    billStudentFail: props<{ error: HttpErrorResponse }>(),
    removeBill: props<{ bill: BillModel }>(),
    removeBillSuccess: props<{ bill: BillModel }>(),
    removeBillFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const receiptActions = createActionGroup({
  source: 'Receipt Component',
  events: {
    fetchStudentOutstandingBalance: props<{ studentNumber: string }>(),
    fetchStudentOutstandingBalanceSuccess: props<{
      amountDue: number;
    }>(),
    fetchStudentOutstandingBalanceFail: props<{ error: HttpErrorResponse }>(),

    clearStudentFinancials: emptyProps(),

    fetchAllReceipts: emptyProps(),
    fetchAllReceiptsSuccess: props<{ allReceipts: ReceiptModel[] }>(),
    fetchAllReceiptsFail: props<{ error: HttpErrorResponse }>(),

    saveReceipt: props<{
      studentNumber: string;
      amountPaid: number;
      paymentMethod: PaymentMethods;
      description?: string;
    }>(),
    saveReceiptSuccess: props<{ receipt: ReceiptModel }>(),
    saveReceiptFail: props<{ error: HttpErrorResponse }>(),

    // --- AMENDED downloadReceiptPdf action ---
    downloadReceiptPdf: props<{ receiptNumber: string }>(), // Only needs receiptId
    downloadReceiptPdfSuccess: props<{ fileName: string }>(), // Pass filename for clarity/feedback
    downloadReceiptPdfFail: props<{ error: HttpErrorResponse }>(),

    clearCreatedReceipt: emptyProps(),

    fetchStudentReceipts: props<{ studentNumber: string }>(),
    fetchStudentReceiptsSuccess: props<{ studentReceipts: ReceiptModel[] }>(),
    fetchStudentReceiptsFail: props<{ error: HttpErrorResponse }>(),

    // --- NEW ACTIONS FOR VOIDING ---
    'Void Receipt': props<{ receiptId: number }>(), // Request to void a receipt
    'Void Receipt Success': props<{ receipt: ReceiptModel }>(), // Voiding successful, provide updated receipt
    'Void Receipt Failure': props<{ error: HttpErrorResponse }>(), // Voiding failed
  },
});

// Actions for Exemption Management
export const exemptionActions = createActionGroup({
  source: 'Exemption',
  events: {
    'Create Exemption': props<{ exemption: ExemptionModel }>(),
    'Create Exemption Success': props<{ exemption: ExemptionModel }>(),
    'Create Exemption Failure': props<{ error: string }>(),
    // You might add actions for Fetching, Updating, Deleting exemptions here later
  },
});
