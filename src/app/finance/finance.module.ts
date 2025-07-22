import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
import { SearchReceiptComponent } from './payments/search-receipt/search-receipt.component';
import { FilterReceiptsDialogComponent } from './payments/filter-receipts-dialog/filter-receipts-dialog.component';
import { ReceiptSummaryCardComponent } from './payments/receipt-item/receipt-summary-card.component/receipt-summary-card.component.component';
import { AddReceiptDialogComponent } from './payments/add-receipt-dialog/add-receipt-dialog.component';
import { StudentFinancialsDashboardComponent } from './student-financials/student-financials-dashboard/student-financials-dashboard.component';
import { StudentInvoicesComponent } from './student-financials/student-invoices/student-invoices.component';
import { StudentReceiptsComponent } from './student-financials/student-receipts/student-receipts.component';
import { StudentPaymentHistoryComponent } from './student-financials/student-payment-history/student-payment-history.component';
import { StudentLedgerReportComponent } from './reports/student-ledger-report/student-ledger-report.component';
import { FeesCollectionReportComponent } from './reports/fees-collection-report/fees-collection-report.component';
import { NgChartsModule } from 'ng2-charts';
import { OutstandingFeesReportComponent } from './reports/outstanding-fees-report/outstanding-fees-report.component';
import { AgedDebtorsReportComponent } from './reports/aged-debtors-report/aged-debtors-report.component';
import { RevenueRecognitionReportComponent } from './reports/revenue-recognition-report/revenue-recognition-report.component';
import { EnrollmentBillingReconciliationReportComponent } from './reports/enrollment-billing-reconciliation-report/enrollment-billing-reconciliation-report.component';
import { CreateExemptionComponent } from './create-exemption/create-exemption.component';
import { ExemptionReportsComponent } from './reports/exemption-reports/exemption-reports/exemption-reports.component';
import { ExemptionReportFiltersComponent } from './reports/exemption-reports/exemption-report-filters/exemption-report-filters.component';
import { TotalExemptionAmountCardComponent } from './reports/exemption-reports/total-exemption-amount-card/total-exemption-amount-card.component';
import { ExemptionSummaryByTypeTableComponent } from './reports/exemption-reports/exemption-summary-by-type-table.component/exemption-summary-by-type-table.component.component';
import { ExemptionDetailedListTableComponent } from './reports/exemption-reports/exemption-detailed-list-table/exemption-detailed-list-table.component';
import { GetUniqueTermNumbersPipe } from '../shared/pipes/get-unique-term-numbers.pipe';
import { ExemptionSummaryByStudentTableComponent } from './reports/exemption-reports/exemption-summary-by-student-table/exemption-summary-by-student-table.component';
import { ExemptionSummaryByEnrolmentTableComponent } from './reports/exemption-reports/exemption-summary-by-enrolment-table/exemption-summary-by-enrolment-table.component';

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
    SearchReceiptComponent,
    FilterReceiptsDialogComponent,
    ReceiptSummaryCardComponent,
    AddReceiptDialogComponent,
    StudentFinancialsDashboardComponent,
    StudentInvoicesComponent,
    StudentReceiptsComponent,
    StudentPaymentHistoryComponent,
    StudentLedgerReportComponent,
    FeesCollectionReportComponent,
    OutstandingFeesReportComponent,
    AgedDebtorsReportComponent,
    RevenueRecognitionReportComponent,
    EnrollmentBillingReconciliationReportComponent,
    CreateExemptionComponent,
    ExemptionReportsComponent,
    ExemptionReportFiltersComponent,
    TotalExemptionAmountCardComponent,
    ExemptionSummaryByTypeTableComponent,
    ExemptionSummaryByStudentTableComponent,
    ExemptionSummaryByEnrolmentTableComponent,
    ExemptionDetailedListTableComponent,
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
    NgChartsModule,
    DecimalPipe,
  ],
  exports: [CurrentEnrolmentComponent, StudentEnrolmentDetailsComponent],
})
export class FinanceModule {}
