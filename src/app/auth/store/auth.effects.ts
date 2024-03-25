import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import * as fromAuthActions from './auth.actions';
import { SigninInterface } from '../models/signin.model';
import { AuthService } from '../auth.service';
import { signinFailure } from './auth.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { User } from '../models/user.model';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  signinEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.signin),
      exhaustMap((credentials) =>
        this.authService.signin(credentials.signinData).pipe(
          map((resp) => {
            const user: User = jwt_decode(resp.accessToken);
            localStorage.setItem('token', resp.accessToken);

            const payload = {
              ...resp,
              user,
            };

            this.router.navigateByUrl('/dashboard');
            return fromAuthActions.signinSuccess(payload);
          }),
          catchError((error: HttpErrorResponse) =>
            of(signinFailure({ ...error }))
          )
        )
      )
    )
  );

  signupEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.signup),
      exhaustMap((credentials) =>
        this.authService.signup(credentials.signupData).pipe(
          map((resp) => {
            return fromAuthActions.signupSuccess(resp);
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromAuthActions.signupFailure({ ...error }))
          )
        )
      )
    )
  );

  fetchAccountsStatsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.fetchAccountStats),
      exhaustMap(() =>
        this.authService.getAccountsStats().pipe(
          map((stats) => {
            return fromAuthActions.fetchAccountStatsSuccess({ stats });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromAuthActions.fetchAccountStatsFail({ ...error }))
          )
        )
      )
    )
  );
}
