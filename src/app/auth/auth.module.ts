import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { SignupComponent } from './signup/signup.component';
import { StoreModule } from '@ngrx/store';
import { authReducer } from './store/auth.reducer';
import { SigninComponent } from './signin/signin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './store/auth.effects';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';

@NgModule({
  declarations: [SignupComponent, SigninComponent],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    StoreModule.forFeature('auth', authReducer),
    EffectsModule.forFeature([AuthEffects]),
  ],
  providers: [AuthGuardService, AuthService],
})
export class AuthModule {}
