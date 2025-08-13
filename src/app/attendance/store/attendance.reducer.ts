import { createReducer, on } from '@ngrx/store';
import { RegisterModel } from '../models/register.model';
import { markRegisterActions } from './attendance.actions';

export interface State {
  attendances: RegisterModel[];
  allClassAttendances: Array<RegisterModel[]>;
}

export const initialState: State = {
  attendances: [],
  allClassAttendances: [],
};

export const attendanceReducer = createReducer(
  initialState,
  on(
    markRegisterActions.fetchTodayRegisterByClass,
    (state, { name, num, year }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
    })
  ),
  on(
    markRegisterActions.fetchTodayRegisterByClassSuccess,
    (state, { attendances }) => ({
      ...state,
      isLoading: false,
      attendances,
    })
  ),
  on(markRegisterActions.fetchTodayRegisterByClassFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(
    markRegisterActions.fetchDayRegisterByClass,
    (state, { name, num, year }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
    })
  ),
  on(
    markRegisterActions.fetchDayRegisterByClassSuccess,
    (state, { attendances }) => ({
      ...state,
      isLoading: false,
      allClassAttendances: [attendances, ...state.allClassAttendances],
    })
  ),
  on(markRegisterActions.fetchTodayRegisterByClassFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(markRegisterActions.markRegister, (state, { attendance }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(markRegisterActions.markRegiterSuccess, (state, { attendance }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    attendances: [
      ...state.attendances.map((att) =>
        att.student == attendance.student ? (att = attendance) : (att = att)
      ),
    ],
  })),
  on(markRegisterActions.markRegisterFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  }))
);
