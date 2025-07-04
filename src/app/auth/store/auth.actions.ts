import { createAction, createActionGroup, props } from '@ngrx/store';
import { SigninInterface } from '../models/signin.model';
import { SignupInterface } from '../models/signup.model';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user.model';
import { AccountStats } from '../models/account-stats.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { ParentsModel } from 'src/app/registration/models/parents.model';

export const signin = createAction(
  '[Signin] signin',
  props<{ signinData: SigninInterface }>()
);

export const signinSuccess = createAction(
  '[Signin] signin success',
  props<{ accessToken: string; user: User }>()
);

export const signinFailure = createAction(
  '[Signin] signin failure',
  props<{ error: HttpErrorResponse }>()
);

export const signup = createAction(
  '[Signup] signup',
  props<{ signupData: SignupInterface }>()
);

export const signupSuccess = createAction(
  '[Signup] signup success',
  props<{ response: boolean }>()
);

export const signupFailure = createAction(
  '[Signup] signup failure',
  props<{ error: HttpErrorResponse }>()
);

export const resetErrorMessage = createAction(
  '[Auth Module] reset error message'
);

export const logout = createAction('App Component logout');

export const checkAuthStatus = createAction('[Auth] Check Auth Status');

export const fetchAccountStats = createAction(
  '[Dashboard Component] fetch account stats'
);

export const fetchAccountStatsSuccess = createAction(
  '[Dashboard Component] fetch account stats success',
  props<{ stats: AccountStats }>()
);

export const fetchAccountStatsFail = createAction(
  '[Dashboard Component] fetch account stats failure',
  props<{ error: HttpErrorResponse }>()
);

export const fetchUserDetailsActions = createActionGroup({
  source: 'Profile Component',
  events: {
    fetchUser: props<{ id: string }>(),
    fetchUserSuccess: props<{
      user: TeachersModel | StudentsModel | null;
    }>(),
    fetchUserFail: props<{ error: HttpErrorResponse }>(),
  },
});
