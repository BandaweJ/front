import { createReducer, on } from '@ngrx/store';
import { RegisterModel } from '../models/register.model';
import { markRegisterActions, attendanceActions } from './attendance.actions';
import { AttendanceRecord, AttendanceReport, AttendanceSummary } from '../services/attendance.service';

export interface State {
  attendances: RegisterModel[];
  allClassAttendances: Array<RegisterModel[]>;
  classAttendance: AttendanceRecord[];
  attendanceReports: AttendanceReport | null;
  attendanceSummary: AttendanceSummary | null;
  isLoading: boolean;
  errorMessage: string;
}

export const initialState: State = {
  attendances: [],
  allClassAttendances: [],
  classAttendance: [],
  attendanceReports: null,
  attendanceSummary: null,
  isLoading: false,
  errorMessage: '',
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
  })),

  // New attendance actions
  on(attendanceActions.getClassAttendance, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.getClassAttendanceSuccess, (state, { attendance }) => ({
    ...state,
    isLoading: false,
    classAttendance: attendance,
  })),
  on(attendanceActions.getClassAttendanceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.markAttendance, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.markAttendanceSuccess, (state, { attendance }) => ({
    ...state,
    isLoading: false,
    classAttendance: state.classAttendance.map(record =>
      record.studentNumber === attendance.studentNumber ? attendance : record
    ),
  })),
  on(attendanceActions.markAttendanceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.getAttendanceReports, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.getAttendanceReportsSuccess, (state, { reports }) => ({
    ...state,
    isLoading: false,
    attendanceReports: reports,
  })),
  on(attendanceActions.getAttendanceReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.getAttendanceSummary, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.getAttendanceSummarySuccess, (state, { summary }) => ({
    ...state,
    isLoading: false,
    attendanceSummary: summary,
  })),
  on(attendanceActions.getAttendanceSummaryFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.clearAttendanceData, (state) => ({
    ...state,
    classAttendance: [],
    attendanceReports: null,
    attendanceSummary: null,
    errorMessage: '',
  }))
);
