import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import * as fromAuthActions from './auth.actions';
import { SigninInterface } from '../models/signin.model';
import { AuthService } from '../auth.service';
import { signinFailure } from './auth.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { User } from '../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  signinEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.signin),
      exhaustMap((credentials) =>
        this.authService.signin(credentials.signinData).pipe(
          map((resp) => {
            const user: User = jwt_decode(resp.accessToken);

            localStorage.setItem('token', resp.accessToken);
            // localStorage.setItem('user', JSON.stringify(user));

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
          tap(() =>
            this.snackBar.open('Account created successfully', 'Close', {
              duration: 3000,
            })
          ),
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

  fetchUserDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuthActions.fetchUserDetailsActions.fetchUser),
      exhaustMap((data) =>
        this.authService.fetchUserDetails(data.id).pipe(
          map((user) => {
            return fromAuthActions.fetchUserDetailsActions.fetchUserSuccess({
              user,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              fromAuthActions.fetchUserDetailsActions.fetchUserFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromAuthActions.logout), // Listen specifically for the 'logout' action
        tap(() => {
          // Side effect 1: Clear the token from localStorage
          localStorage.removeItem('token');

          // Side effect 2: Navigate to the sign-in page
          this.router.navigateByUrl('/signin');
        })
      ),
    { dispatch: false } // Important: This effect does NOT dispatch a new action
    // after it's done. It only performs side effects.
  );

  checkAuthStatus$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromAuthActions.checkAuthStatus), // Listens for the new action triggered on app startup
        map(() => {
          const authStatus = this.authService.getAuthStatus(); // Get current auth status from service

          if (
            authStatus.isLoggedIn &&
            authStatus.user &&
            authStatus.accessToken
          ) {
            // If a valid token was found and decoded
            console.log(
              'AuthEffects: Valid token found. User is logged in. Navigating to /dashboard.'
            );
            this.router.navigateByUrl('/dashboard'); // Navigate to dashboard
            return fromAuthActions.signinSuccess({
              // Dispatch success to update NGRX state
              user: authStatus.user,
              accessToken: authStatus.accessToken,
            });
          } else {
            // No valid token found (expired or not present)
            console.log(
              'AuthEffects: No valid token found. Navigating to /signin.'
            );
            // Ensure any expired token is cleared if it wasn't already by getAuthStatus itself
            localStorage.removeItem('token');
            this.router.navigateByUrl('/signin'); // Navigate to signin page
            return fromAuthActions.logout(); // Dispatch logout to ensure state is clean
          }
        })
      )
    // No `dispatch: false` because this effect explicitly dispatches `loginSuccess` or `logout`.
  );
}
