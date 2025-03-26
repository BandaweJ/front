import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { FinanceService } from '../services/finance.service';
import * as fromFinanceActions from './finance.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Injectable()
export class FinanceEffects {
  constructor(
    private actions$: Actions,
    private financeService: FinanceService,
    private snackBar: MatSnackBar
  ) {}

  fetchFees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromFinanceActions.feesActions.fetchFees),
      switchMap(() =>
        this.financeService.getAllFees().pipe(
          map((fees) => {
            // Sort the classes array here
            const sortedFees = [...fees].sort((a, b) => {
              // Replace 'name' with the property you want to sort by
              // and adjust the sorting logic as needed.
              if (a.year < b.year) {
                return -1;
              }
              if (a.year > b.year) {
                return 1;
              }
              return 0; // Equal
            });

            return fromFinanceActions.feesActions.fetchFeesSuccess({
              fees: sortedFees,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromFinanceActions.feesActions.fetchFeesFail({ ...error }))
          )
        )
      )
    )
  );

  addFees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromFinanceActions.feesActions.addFee),
      switchMap((data) =>
        this.financeService.createFee(data.fee).pipe(
          tap(() =>
            this.snackBar.open('Fees Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((fee) => {
            // console.log(teacher);
            return fromFinanceActions.feesActions.addFeeSuccess({ fee });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromFinanceActions.feesActions.addFeeFail({ ...error }))
          )
        )
      )
    )
  );
}
