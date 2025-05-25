import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeesComponent } from './fees/fees.component';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { financeReducer } from './store/finance.reducer';
import { FinanceEffects } from './store/finance.effects';
import { AddEditFeesComponent } from './fees/add-edit-fees/add-edit-fees.component';
import { PaymentsComponent } from './payments/payments.component';
import { StudentFinanceComponent } from './student-finance/student-finance.component';
import { StudentsToBillComponent } from './student-finance/students-to-bill/students-to-bill.component';
import { StudentEnrolmentDetailsComponent } from './student-finance/student-enrolment-details/student-enrolment-details.component';
import { CurrentEnrolmentComponent } from './student-finance/current-enrolment/current-enrolment.component';
import { InvoiceComponent } from './student-finance/invoice/invoice.component';
import { BillingComponent } from './student-finance/billing/billing.component';
import { StudentBalancesComponent } from './student-balances/student-balances.component';
import { SharedModule } from '../shared/shared.module';
import { AddEditBalancesComponent } from './student-balances/add-edit-balances/add-edit-balances.component';
import { EnrolmentModule } from '../enrolment/enrolment.module';
import { InvoiceItemComponent } from './student-finance/invoice/invoice-item/invoice-item.component';
import { SearchInvoiceComponent } from './student-finance/invoice/search-invoice/search-invoice.component';
import { InvoiceListComponent } from './student-finance/invoice/invoice-list/invoice-list.component';
import { ReceiptItemComponent } from './payments/receipt-item/receipt-item.component';

@NgModule({
  declarations: [
    FeesComponent,
    AddEditFeesComponent,
    PaymentsComponent,
    StudentFinanceComponent,
    StudentsToBillComponent,
    StudentEnrolmentDetailsComponent,
    CurrentEnrolmentComponent,
    InvoiceComponent,
    BillingComponent,
    StudentBalancesComponent,
    AddEditBalancesComponent,
    InvoiceItemComponent,
    SearchInvoiceComponent,
    InvoiceListComponent,
    ReceiptItemComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    EnrolmentModule,
    StoreModule.forFeature('finance', financeReducer),
    EffectsModule.forFeature([FinanceEffects]),
  ],
  exports: [CurrentEnrolmentComponent, StudentEnrolmentDetailsComponent],
})
export class FinanceModule {}
