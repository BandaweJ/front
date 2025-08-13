import { Actions, createEffect, ofType } from '@ngrx/effects';
import { markRegisterActions } from './attendance.actions';
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
            map((attendances) => {
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
            map((attendances) => {
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
          map((attendance) => {
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
}
