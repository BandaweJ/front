import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { FinanceService } from '../services/finance.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  balancesActions,
  billingActions,
  billStudentAction,
  feesActions,
  invoiceActions,
  isNewComerActions,
} from './finance.actions';
import { PaymentsService } from '../services/payments.service';
import { EnrolService } from 'src/app/enrolment/services/enrol.service';
@Injectable()
export class FinanceEffects {
  constructor(
    private actions$: Actions,
    private financeService: FinanceService,
    private paymentsService: PaymentsService,
    private enrolService: EnrolService,
    private snackBar: MatSnackBar
  ) {}

  fetchFees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(feesActions.fetchFees),
      switchMap(() =>
        this.financeService.getAllFees().pipe(
          map((fees) => {
            // Sort the fees array here
            const sortedFees = [...fees].sort((a, b) => {
              // Replace 'name' with the property you want to sort by
              // and adjust the sorting logic as needed.
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0; // Equal
            });

            return feesActions.fetchFeesSuccess({
              fees: sortedFees,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(feesActions.fetchFeesFail({ ...error }))
          )
        )
      )
    )
  );

  addFees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(feesActions.addFee),
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
            return feesActions.addFeeSuccess({ fee });
          }),
          catchError((error: HttpErrorResponse) =>
            of(feesActions.addFeeFail({ ...error })).pipe(
              tap(() =>
                this.snackBar.open(error.message, 'OK', {
                  duration: 3000,
                  verticalPosition: 'top',
                  horizontalPosition: 'center',
                })
              )
            )
          )
        )
      )
    )
  );

  editFees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(feesActions.editFee),
      switchMap((data) =>
        this.financeService.editFees(data.id, data.fee).pipe(
          tap((data) =>
            this.snackBar.open('Fees Edited Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((fee) => {
            // console.log(teacher);
            return feesActions.editFeeSuccess({
              fee,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(feesActions.editFeeFail({ ...error })).pipe(
              tap(() =>
                this.snackBar.open(error.message, 'OK', {
                  duration: 3000,
                  verticalPosition: 'top',
                  horizontalPosition: 'center',
                })
              )
            )
          )
        )
      )
    )
  );

  fetchStudentsToBill$ = createEffect(() =>
    this.actions$.pipe(
      ofType(billingActions.fetchStudentsToBill),
      switchMap((data) =>
        this.financeService
          .getStudentsNotYetBilledForTerm(data.num, data.year)
          .pipe(
            map((studentsToBill) => {
              return billingActions.fetchStudentsToBillSuccess({
                studentsToBill,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(billingActions.fetchStudentsToBillFail({ ...error }))
            )
          )
      )
    )
  );

  fetchInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(invoiceActions.fetchInvoice),
      switchMap((data) =>
        this.paymentsService.getInvoice(data.studentNumber).pipe(
          map((invoice) => {
            return invoiceActions.fetchInvoiceSuccess({
              invoice,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(invoiceActions.fetchInvoiceFail({ ...error }))
          )
        )
      )
    )
  );

  addBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(balancesActions.saveBalance),
      switchMap((data) =>
        this.financeService.createFeesBalance(data.balance).pipe(
          tap(() =>
            this.snackBar.open('Balance Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((balance) => {
            return balancesActions.saveBalanceSuccess({ balance });
          }),
          catchError((error: HttpErrorResponse) =>
            of(balancesActions.saveBalanceFail({ ...error })).pipe(
              tap(() =>
                this.snackBar.open(error.error.message, 'OK', {
                  duration: 3000,
                  verticalPosition: 'top',
                  horizontalPosition: 'center',
                })
              )
            )
          )
        )
      )
    )
  );

  isNewComer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(isNewComerActions.checkIsNewComer),
      switchMap((data) =>
        this.enrolService.isNewComer(data.studentNumber).pipe(
          map((isNewComer) => {
            return isNewComerActions.checkIsNewComerSuccess({
              isNewComer,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(isNewComerActions.checkIsNewComerFail({ ...error }))
          )
        )
      )
    )
  );

  createBills$ = createEffect(() =>
    this.actions$.pipe(
      ofType(billStudentAction.billStudent),
      switchMap((data) =>
        this.financeService.createBills(data.bills).pipe(
          tap(() =>
            this.snackBar.open('Bills Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((bills) => {
            return billStudentAction.billStudentSuccess({ bills });
          }),
          catchError((error: HttpErrorResponse) =>
            of(billStudentAction.billStudentFail({ ...error }))
          )
        )
      )
    )
  );
}
