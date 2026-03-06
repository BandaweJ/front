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

/** When user is parent: list of linked child student numbers; otherwise null (no restriction). */
export const selectLinkedStudentNumbers = createSelector(
  authState,
  (state: fromAuthReducer.State) => {
    const role = state.user?.role;
    const details = state.userDetails;
    if (role !== 'parent' || !details || !('students' in details)) return null;
    const students = (details as { students?: { studentNumber: string }[] }).students;
    return (students || []).map((s) => s.studentNumber);
  }
);

/** When user is parent: list of linked children for dropdowns; otherwise empty array. */
export const selectLinkedChildrenForParent = createSelector(
  authState,
  (state: fromAuthReducer.State) => {
    const role = state.user?.role;
    const details = state.userDetails;
    if (role !== 'parent' || !details || !('students' in details)) return [];
    const students = (details as { students?: { studentNumber: string; name?: string; surname?: string }[] }).students;
    return students || [];
  }
);

export const selectIsParent = createSelector(
  selectAuthUserRole,
  (role) => role === 'parent'
);
