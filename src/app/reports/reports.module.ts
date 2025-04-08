import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ReportsComponent } from './reports/reports.component';
import { reportsReducer } from './store/reports.reducer';
import { ReportsEffects } from './store/reports.effects';
import { ReportComponent } from './report/report.component';
import { FinanceModule } from '../finance/finance.module';
// import { PaymentModule } from '../';

@NgModule({
  declarations: [ReportsComponent, ReportComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FinanceModule,
    StoreModule.forFeature('reports', reportsReducer),
    EffectsModule.forFeature([ReportsEffects]),
  ],
})
export class ReportsModule {}
