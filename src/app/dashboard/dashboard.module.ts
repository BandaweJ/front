import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EnrolmentChartComponent } from './enrolment-chart/enrolment-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { AccountsChartComponent } from './accounts-chart/accounts-chart.component';
import { MaterialModule } from '../material/material.module';
import { ClassAttendanceSummaryComponent } from './class-attendance-summary/class-attendance-summary.component';
import { FinanceModule } from '../finance/finance.module';
import { ReportsModule } from '../reports/reports.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DashboardComponent,
    EnrolmentChartComponent,
    AccountsChartComponent,
    ClassAttendanceSummaryComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    MaterialModule,
    FinanceModule,
    ReportsModule,
  ],
})
export class DashboardModule {}
