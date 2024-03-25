import { createReducer, on } from '@ngrx/store';
import * as authActions from './auth.actions';
import { User } from '../models/user.model';
import { AccountStats } from '../models/account-stats.model';

export interface State {
  accessToken: string;
  errorMessage: string;
  isLoggedin: boolean;
  user: User | null;
  accStats: AccountStats | null;
  isLoading: boolean;
}

export const initialState: State = {
  accessToken: '',
  errorMessage: '',
  isLoggedin: false,
  user: null,
  accStats: null,
  isLoading: false,
};

export const authReducer = createReducer(
  initialState,
  on(authActions.signin, (state, { signinData }) => ({
    ...state,
    isLoading: true,
    accessToken: '',
    errorMessage: '',
    isLoggedin: false,
    accStats: null,
  })),
  on(authActions.signinSuccess, (state, { accessToken, user }) => ({
    ...state,
    accessToken,
    isLoggedin: true,
    errorMessage: '',
    user: user,
    accStats: null,
    isLoading: false,
  })),
  on(authActions.signinFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoggedin: false,
    accessToken: '',
    user: null,
    accStats: null,
    isLoading: false,
  })),
  on(authActions.signin, (state) => ({
    ...state,
    errorMessage: '',
    isLoggedin: false,
    accessToken: '',
    user: null,
    accStats: null,
    isLoading: true,
  })),
  on(authActions.signupSuccess, (state, { response }) => ({
    ...state,
    errorMessage: '',
    accessToken: '',
    isLoggedin: false,
    user: null,
    accStats: null,
    isLoading: false,
  })),
  on(authActions.signupFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoggedin: false,
    accessToken: '',
    user: null,
    accStats: null,
    isLoading: false,
  })),
  on(authActions.resetErrorMessage, (state) => ({
    ...state,
    errorMessage: '',
  })),
  on(authActions.logout, (state) => ({
    ...state,
    isLoggedin: false,
    accessToken: '',
    errorMessage: '',
  })),
  on(authActions.fetchAccountStats, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(authActions.fetchAccountStatsSuccess, (state, { stats }) => ({
    ...state,
    isLoading: false,
    accStats: { ...stats },
  })),
  on(authActions.fetchAccountStatsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  }))
);
