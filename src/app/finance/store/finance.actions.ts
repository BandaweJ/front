import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FeesModel } from '../models/fees.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';

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
    // deleteFee: props<{ id: number }>(),
    // deleteFeeSuccess: props<{ id: number }>(),
    // deleteFeeFail: props<{ error: HttpErrorResponse }>(),
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
    fetchInvoice: props<{ studentNumber: string }>(),
    fetchInvoiceSuccess: props<{ invoice: InvoiceModel }>(),
    fetchInvoiceFail: props<{ error: HttpErrorResponse }>(),
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
