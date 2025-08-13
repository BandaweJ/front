import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { StudentsListComponent } from './registration/students-list/students-list.component';
import { TeachersListComponent } from './registration/teachers-list/teachers-list.component';
import { TermsClassesComponent } from './enrolment/terms-classes/terms-classes.component';
import { TermsComponent } from './enrolment/terms-classes/terms/terms.component';
import { ClassesComponent } from './enrolment/terms-classes/classes/classes.component';
import { SubjectsComponent } from './marks/subjects/subjects.component';
import { EnterMarksComponent } from './marks/enter-marks/enter-marks.component';
import { ReportsComponent } from './reports/reports/reports.component';
import { MarkRegisterComponent } from './attendance/mark-register/mark-register.component';
import { MigrateClassEnrolmentComponent } from './enrolment/migrate-class-enrolment/migrate-class-enrolment.component';
import { TeachersCommentsComponent } from './marks/teachers-comments/teachers-comments.component';
import { MarksSheetsComponent } from './marks/marks-sheets/marks-sheets.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { TeacherViewComponent } from './registration/teachers-list/teacher-view/teacher-view.component';
import { StudentViewComponent } from './registration/students-list/student-view/student-view.component';
import { ClassListsComponent } from './enrolment/terms-classes/class-lists/class-lists.component';
import { MarksProgressComponent } from './marks/marks-progress/marks-progress.component';
import { FeesComponent } from './finance/fees/fees.component';
import { StudentFinanceComponent } from './finance/student-finance/student-finance.component';
import { StudentBalancesComponent } from './finance/student-balances/student-balances.component';
import { InvoiceComponent } from './finance/student-finance/invoice/invoice.component';
import { PaymentsComponent } from './finance/payments/payments.component';
import { StudentFinancialsDashboardComponent } from './finance/student-financials/student-financials-dashboard/student-financials-dashboard.component';
import { StudentInvoicesComponent } from './finance/student-financials/student-invoices/student-invoices.component';
import { StudentReceiptsComponent } from './finance/student-financials/student-receipts/student-receipts.component';
import { StudentPaymentHistoryComponent } from './finance/student-financials/student-payment-history/student-payment-history.component';
import { StudentLedgerReportComponent } from './finance/reports/student-ledger-report/student-ledger-report.component';
import { FeesCollectionReportComponent } from './finance/reports/fees-collection-report/fees-collection-report.component';
import { OutstandingFeesReportComponent } from './finance/reports/outstanding-fees-report/outstanding-fees-report.component';
import { AgedDebtorsReportComponent } from './finance/reports/aged-debtors-report/aged-debtors-report.component';
import { RevenueRecognitionReportComponent } from './finance/reports/revenue-recognition-report/revenue-recognition-report.component';
import { EnrollmentBillingReconciliationReportComponent } from './finance/reports/enrollment-billing-reconciliation-report/enrollment-billing-reconciliation-report.component';
import { ResultsAnalysisComponent } from './results-analysis/results-analysis.component';
import { CreateExemptionComponent } from './finance/create-exemption/create-exemption.component';
import { ExemptionReportsComponent } from './finance/reports/exemption-reports/exemption-reports/exemption-reports.component';

const routes: Routes = [
  { path: 'signin', component: SigninComponent, title: 'Sign In' },
  { path: 'signup', component: SignupComponent, title: 'Sign Up' },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService],
    title: 'Profile',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard',
    canActivate: [AuthGuardService],
  },
  {
    path: 'teachers',
    component: TeachersListComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Teachers',
  },
  {
    path: 'teacher-view/:id',
    component: TeacherViewComponent,
    canActivate: [AuthGuardService],
    title: 'Teacher Details',
  },
  {
    path: 'student-financials', // Route with studentNumber parameter
    component: StudentFinancialsDashboardComponent,
    canActivate: [AuthGuardService],
    children: [
      // Child routes for the tabs
      { path: '', redirectTo: 'invoices', pathMatch: 'full' },
      { path: 'invoices', component: StudentInvoicesComponent },
      { path: 'receipts', component: StudentReceiptsComponent },
      { path: 'payment-history', component: StudentPaymentHistoryComponent },
    ],
  },
  {
    path: 'students',
    component: StudentsListComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Students',
  },
  {
    path: 'student-view/:studentNumber',
    component: StudentViewComponent,
    canActivate: [AuthGuardService],
    title: 'Student Details',
  },
  {
    path: 'classes',
    component: ClassesComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Classes',
  },
  {
    path: 'terms',
    component: TermsComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Terms',
  },
  {
    path: 'enrol',
    component: TermsClassesComponent,
    canActivate: [AuthGuardService],
    title: 'Enrol Students',
  },
  {
    path: 'class-lists',
    component: ClassListsComponent,
    canActivate: [AuthGuardService],
    title: 'Class Lists',
  },
  {
    path: 'migrate-class',
    component: MigrateClassEnrolmentComponent,
    canActivate: [AuthGuardService],
    title: 'Migrate Class Enrolment',
  },
  {
    path: 'subjects',
    component: SubjectsComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Subjects',
  },
  {
    path: 'input',
    component: EnterMarksComponent,
    canActivate: [AuthGuardService],
    title: 'Enter Marks',
  },
  {
    path: 'marks-progress',
    component: MarksProgressComponent,
    canActivate: [AuthGuardService],
    title: 'Marks Capture Progress',
  },
  {
    path: 'mark-sheets',
    component: MarksSheetsComponent,
    canActivate: [AuthGuardService],
    title: 'Mark Sheets',
  },

  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuardService],
    title: 'Progress Reports',
  },
  {
    path: 'mark-register',
    component: MarkRegisterComponent,
    canActivate: [AuthGuardService],
    title: 'Mark Attendance Register',
  },
  {
    path: 'teachers-comments',
    component: TeachersCommentsComponent,
    canActivate: [AuthGuardService],
    title: 'Teacher Comments',
  },
  {
    path: 'results-analysis',
    component: ResultsAnalysisComponent,
    canActivate: [AuthGuardService],
    title: 'Results Analysis',
  },
  {
    path: 'fees',
    component: FeesComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Fees',
  },
  {
    path: 'balances',
    component: StudentBalancesComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Balances',
  },
  {
    path: 'invoice',
    component: InvoiceComponent,
    canActivate: [AuthGuardService],
    title: 'Invoice',
  },
  {
    path: 'student-finance',
    component: StudentFinanceComponent,
    canActivate: [AuthGuardService],
    title: 'Individual Student Finance',
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [AuthGuardService],
    title: 'Receipting',
  },
  {
    path: 'exemptions',
    component: CreateExemptionComponent,
    canActivate: [AuthGuardService],
    title: 'Create Exemption',
  },
  {
    canActivate: [AuthGuardService],
    path: 'student-ledger',
    component: StudentLedgerReportComponent,
    title: 'Student Ledger Reports',
  },
  {
    canActivate: [AuthGuardService],
    path: 'fees-collection',
    component: FeesCollectionReportComponent,
    title: 'Fees Collection Report',
  },
  {
    canActivate: [AuthGuardService],
    path: 'outstanding-fees',
    component: OutstandingFeesReportComponent,
    title: 'Outstanding Fees Report',
  },
  {
    canActivate: [AuthGuardService],
    path: 'exemption-reports',
    component: ExemptionReportsComponent,
    title: 'Exemption Reports',
  },
  {
    canActivate: [AuthGuardService],
    path: 'aged-debtors',
    component: AgedDebtorsReportComponent,
    title: 'Aged Debtors Report',
  },
  {
    canActivate: [AuthGuardService],
    path: 'enrollment-billing-reconciliation',
    component: EnrollmentBillingReconciliationReportComponent,
  },
  {
    canActivate: [AuthGuardService],
    path: 'revenue-recognition',
    component: RevenueRecognitionReportComponent,
    title: 'Revenue Recognition',
  },
  {
    path: '', // Default route for the root path
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: '**', // Wildcard route for any unmatched paths
    // Redirect to 'signin' if any unknown route is hit.
    // This prevents hitting guarded routes when not logged in.
    redirectTo: 'signin',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
