import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as reportsActions from './reports.actions';
import { catchError, map, of, switchMap } from 'rxjs';
import { ReportsService } from '../services/reports.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class ReportsEffects {
  constructor(
    private actions$: Actions,
    private reportsService: ReportsService
  ) {}

  generateReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.generateReports),
      switchMap((data) =>
        this.reportsService
          .generateReports(data.name, data.num, data.year)
          .pipe(
            map((reports) =>
              reportsActions.generateReportsSuccess({ reports })
            ),
            catchError((error: HttpErrorResponse) =>
              of(reportsActions.generateReportsFail({ ...error }))
            )
          )
      )
    )
  );

  saveReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.saveReportActions.saveReports),
      switchMap((data) =>
        this.reportsService
          .saveReports(data.name, data.num, data.year, data.reports)
          .pipe(
            map((reports) =>
              reportsActions.saveReportActions.saveReportsSuccess({ reports })
            ),
            catchError((error: HttpErrorResponse) =>
              of(reportsActions.saveReportActions.saveReportsFail({ ...error }))
            )
          )
      )
    )
  );

  viewReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.viewReportsActions.viewReports),
      switchMap((data) =>
        this.reportsService.viewReports(data.name, data.num, data.year).pipe(
          map((reports) =>
            reportsActions.viewReportsActions.viewReportsSuccess({ reports })
          ),
          catchError((error: HttpErrorResponse) =>
            of(reportsActions.saveReportActions.saveReportsFail({ ...error }))
          )
        )
      )
    )
  );

  downloadReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.downloadReportActions.downloadReport),
      switchMap((data) =>
        this.reportsService
          .downloadReport(data.name, data.num, data.year, data.studentNumber)
          // .unsubscribe()
          .pipe(
            map((result) =>
              reportsActions.downloadReportActions.downloadReportSuccess()
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                reportsActions.downloadReportActions.downloadReportFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  saveHeadComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.saveHeadCommentActions.saveHeadComment),
      switchMap((data) =>
        this.reportsService.saveHeadComment(data.comment).pipe(
          map((report) =>
            reportsActions.saveHeadCommentActions.saveHeadCommentSuccess({
              report,
            })
          ),
          catchError((error: HttpErrorResponse) =>
            of(
              reportsActions.saveHeadCommentActions.saveHeadCommentFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );
}
