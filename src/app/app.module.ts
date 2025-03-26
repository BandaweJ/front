import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { StoreModule } from '@ngrx/store';
import { AuthModule } from './auth/auth.module';
import * as authReducer from './auth/store/auth.reducer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProfileButtonsComponent } from './profile-buttons/profile-buttons.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { RegistrationModule } from './registration/registration.module';
import { EnrolmentModule } from './enrolment/enrolment.module';
import { MarksModule } from './marks/marks.module';
import { ReportsModule } from './reports/reports.module';
import { NgChartsModule } from 'ng2-charts';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthService } from './auth/auth.service';
import { FinanceModule } from './finance/finance.module';

@NgModule({
  declarations: [AppComponent, ProfileButtonsComponent],
  imports: [
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardModule,
    AuthModule,
    RegistrationModule,
    EnrolmentModule,
    MarksModule,
    ReportsModule,
    AttendanceModule,
    FinanceModule,
    MaterialModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgChartsModule,
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      // logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    EffectsModule.forRoot([]),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () =>
        authService.checkTokenAndNavigate(),
      deps: [AuthService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
