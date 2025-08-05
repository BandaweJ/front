import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuthReducer from '../store/auth.reducer';

export const authState = createFeatureSelector<fromAuthReducer.State>('auth');

export const selectErrorMsg = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.errorMessage
);

export const selectIsLoggedIn = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.isLoggedin
);

export const isLoading = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.isLoading
);

export const selectAccStats = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.accStats
);

export const selectUser = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.user
);

export const selectAuthUserRole = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.user?.role
);

export const selectAuthUserId = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.user?.id
);

export const selectUserDetails = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.userDetails
);
