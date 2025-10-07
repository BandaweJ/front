import { Actions, createEffect, ofType } from '@ngrx/effects';
import { markRegisterActions, attendanceActions } from './attendance.actions';
import { AttendanceService } from '../services/attendance.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AttendanceEffects {
  constructor(
    private actions$: Actions,
    private attendanceService: AttendanceService
  ) {}

  fetchTodayRegisterByClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markRegisterActions.fetchTodayRegisterByClass),
      switchMap((data) =>
        this.attendanceService
          .getTodayRegisterByClass(data.name, data.num, data.year)
          .pipe(
            map((attendances: any[]) => {
              return markRegisterActions.fetchTodayRegisterByClassSuccess({
                attendances,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                markRegisterActions.fetchTodayRegisterByClassFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  fetchDayRegisterByClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markRegisterActions.fetchDayRegisterByClass),
      switchMap((data) =>
        this.attendanceService
          .getTodayRegisterByClass(data.name, data.num, data.year)
          .pipe(
            map((attendances: any[]) => {
              return markRegisterActions.fetchDayRegisterByClassSuccess({
                attendances,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                markRegisterActions.fetchDayRegisterByClassFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  markRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markRegisterActions.markRegister),
      switchMap((data) =>
        this.attendanceService.markRegister(data.attendance, data.present).pipe(
          map((attendance: any) => {
            return markRegisterActions.markRegiterSuccess({
              attendance,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              markRegisterActions.markRegisterFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );

  // New attendance effects
  getClassAttendance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(attendanceActions.getClassAttendance),
      switchMap(({ className, termNum, year, date }) =>
        this.attendanceService.getClassAttendance(className, termNum, year, date).pipe(
          map((attendance) =>
            attendanceActions.getClassAttendanceSuccess({ attendance })
          ),
          catchError((error: HttpErrorResponse) =>
            of(attendanceActions.getClassAttendanceFail({ error }))
          )
        )
      )
    )
  );

  markAttendance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(attendanceActions.markAttendance),
      switchMap(({ studentNumber, className, termNum, year, present, date }) =>
        this.attendanceService.markAttendance({
          studentNumber,
          className,
          termNum,
          year,
          present,
          date,
        }).pipe(
          map((attendance) =>
            attendanceActions.markAttendanceSuccess({ attendance })
          ),
          catchError((error: HttpErrorResponse) =>
            of(attendanceActions.markAttendanceFail({ error }))
          )
        )
      )
    )
  );

  getAttendanceReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(attendanceActions.getAttendanceReports),
      switchMap(({ className, termNum, year, startDate, endDate }) =>
        this.attendanceService.getAttendanceReports(className, termNum, year, startDate, endDate).pipe(
          map((reports) =>
            attendanceActions.getAttendanceReportsSuccess({ reports })
          ),
          catchError((error: HttpErrorResponse) =>
            of(attendanceActions.getAttendanceReportsFail({ error }))
          )
        )
      )
    )
  );

  getAttendanceSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(attendanceActions.getAttendanceSummary),
      switchMap(({ className, termNum, year }) =>
        this.attendanceService.getAttendanceSummary(className, termNum, year).pipe(
          map((summary) =>
            attendanceActions.getAttendanceSummarySuccess({ summary })
          ),
          catchError((error: HttpErrorResponse) =>
            of(attendanceActions.getAttendanceSummaryFail({ error }))
          )
        )
      )
    )
  );
}
