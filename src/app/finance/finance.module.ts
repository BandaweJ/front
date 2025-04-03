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
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forFeature('finance', financeReducer),
    EffectsModule.forFeature([FinanceEffects]),
  ],
})
export class FinanceModule {}
