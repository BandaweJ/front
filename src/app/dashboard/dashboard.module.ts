import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EnrolmentChartComponent } from './enrolment-chart/enrolment-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { AccountsChartComponent } from './accounts-chart/accounts-chart.component';
import { MaterialModule } from '../material/material.module';
import { ClassAttendanceSummaryComponent } from './class-attendance-summary/class-attendance-summary.component';

@NgModule({
  declarations: [
    DashboardComponent,
    EnrolmentChartComponent,
    AccountsChartComponent,
    ClassAttendanceSummaryComponent,
  ],
  imports: [CommonModule, NgChartsModule, MaterialModule],
})
export class DashboardModule {}
