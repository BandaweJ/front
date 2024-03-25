import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromEnrolmentActions from './enrolment.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ClassesService } from '../services/classes.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TermsService } from '../services/terms.service';
import { EnrolService } from '../services/enrol.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class EnrolmentEffects {
  constructor(
    private actions$: Actions,
    private classesService: ClassesService,
    private termsService: TermsService,
    private enrolService: EnrolService,
    private snackBar: MatSnackBar
  ) {}

  fetchClasses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.fetchClasses),
      switchMap(() =>
        this.classesService.getAllClasses().pipe(
          map((classes) =>
            fromEnrolmentActions.fetchClassesSuccess({ classes })
          ),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.fetchClassesFailure({ ...error }))
          )
        )
      )
    )
  );

  addClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.addClassAction),
      switchMap((data) =>
        this.classesService.addClass(data.clas).pipe(
          tap((data) =>
            this.snackBar.open('Class Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((clas) => {
            // console.log(teacher);
            return fromEnrolmentActions.addClassActionSuccess({ clas });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.addClassActionFail({ ...error }))
          )
        )
      )
    )
  );

  deleteClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.deleteClassAction),
      switchMap((data) =>
        this.classesService.deleteClass(data.name).pipe(
          tap((data) =>
            this.snackBar.open('Class Deleted Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map(({ name }) => {
            // console.log(teacher);
            return fromEnrolmentActions.deleteClassSuccess({
              name,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.deleteClassFail({ ...error }))
          )
        )
      )
    )
  );

  editClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.editClassAction),
      switchMap((data) =>
        this.classesService.editClass(data.clas).pipe(
          tap((data) =>
            this.snackBar.open('Class Edited Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((clas) => {
            // console.log(teacher);
            return fromEnrolmentActions.editClassSuccess({
              clas,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.editClassFail({ ...error }))
          )
        )
      )
    )
  );

  fetchTerms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.fetchTerms),
      switchMap(() =>
        this.termsService.getAllTerms().pipe(
          map((terms) => fromEnrolmentActions.fetchTermsSuccess({ terms })),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.fetchTermsFailure({ ...error }))
          )
        )
      )
    )
  );

  addTerm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.addTermAction),
      switchMap((data) =>
        this.termsService.addTerm(data.term).pipe(
          tap((data) =>
            this.snackBar.open('Term Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((term) => {
            // console.log(teacher);
            return fromEnrolmentActions.addTermActionSuccess({ term });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.addTermActionFail({ ...error }))
          )
        )
      )
    )
  );

  editTerm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.editTermAction),
      switchMap((data) =>
        this.termsService.editTerm(data.term).pipe(
          tap((data) =>
            this.snackBar.open('Term Edited Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((term) => {
            // console.log(teacher);
            return fromEnrolmentActions.editTermSuccess({
              term,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.editTermFail({ ...error }))
          )
        )
      )
    )
  );

  fetchEnrolmentByClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.getEnrolmentByClass),
      switchMap(({ name, num, year }) =>
        this.enrolService.getEnrolmentByClass(name, num, year).pipe(
          map((enrols) =>
            fromEnrolmentActions.getEnrolmentByClassSuccess({ enrols })
          ),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.getEnrolmentByClassFail({ ...error }))
          )
        )
      )
    )
  );

  enrolStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.enrolStudents),
      switchMap((data) =>
        this.enrolService.enrolStudents(data.enrols).pipe(
          tap((data) =>
            this.snackBar.open('Students Enrolled Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((enrols) => {
            // console.log(teacher);
            return fromEnrolmentActions.enrolStudentsSuccess({ enrols });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.enrolStudentsFail({ ...error }))
          )
        )
      )
    )
  );

  fetchEnrolsStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.fetchEnrolsStats),
      switchMap(() =>
        this.enrolService.getEnrolsStats().pipe(
          map((stats) =>
            fromEnrolmentActions.fetchEnrolsStatsSuccess({ stats })
          ),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.getEnrolmentByClassFail({ ...error }))
          )
        )
      )
    )
  );

  unEnrolStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.UnenrolStudentActions.unenrolStudent),
      switchMap((data) =>
        this.enrolService.unenrolStudent(data.enrol).pipe(
          tap((data) =>
            this.snackBar.open('Student Removed From Class', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((enrol) => {
            // console.log(teacher);
            return fromEnrolmentActions.UnenrolStudentActions.unenrolStudentSuccess(
              { enrol }
            );
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              fromEnrolmentActions.UnenrolStudentActions.unenrolStudentFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );

  migrateClassEnrolment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.migrateClassActions.migrateClassEnrolment),
      switchMap((data) =>
        this.enrolService
          .migrateClass(
            data.fromName,
            data.fromNum,
            data.fromYear,
            data.toName,
            data.toNum,
            data.toYear
          )
          .pipe(
            tap((data) =>
              this.snackBar.open('Students moved to New Class', 'OK', {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              })
            ),
            map((result) => {
              return fromEnrolmentActions.migrateClassActions.migrateClassEnrolmentSuccess(
                {
                  result,
                }
              );
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                fromEnrolmentActions.migrateClassActions.migrateClassEnrolmentFail(
                  {
                    ...error,
                  }
                )
              )
            )
          )
      )
    )
  );
}
