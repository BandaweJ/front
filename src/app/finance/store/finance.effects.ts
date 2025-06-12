import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { FinanceService } from '../services/finance.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  balancesActions,
  billingActions,
  billStudentActions,
  feesActions,
  invoiceActions,
  isNewComerActions,
  receiptActions,
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
        this.paymentsService
          .getInvoice(data.studentNumber, data.num, data.year)
          .pipe(
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

  fetchInvoices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(invoiceActions.fetchInvoices),
      switchMap((data) =>
        this.paymentsService.getInvoices(data.num, data.year).pipe(
          map((invoices) => {
            return invoiceActions.fetchInvoicesSuccess({
              invoices,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(invoiceActions.fetchInvoicesFail({ ...error }))
          )
        )
      )
    )
  );

  fetchInvoiceStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(invoiceActions.fetchInvoiceStats),
      switchMap((data) =>
        this.paymentsService.getInvoiceStats(data.num, data.year).pipe(
          map((invoiceStats) => {
            return invoiceActions.fetchInvoiceStatsSuccess({
              invoiceStats,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(invoiceActions.fetchInvoiceStatsFail({ ...error }))
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

  downloadInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(invoiceActions.downloadInvoice),
      switchMap((data) =>
        this.paymentsService
          .downloadInvoice(data.studentNumber, data.num, data.year)
          // .unsubscribe()
          .pipe(
            map(() => invoiceActions.downloadInvoiceSuccess()),
            catchError((error: HttpErrorResponse) =>
              of(
                invoiceActions.downloadInvoiceFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  saveInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(invoiceActions.saveInvoice),
      switchMap((data) =>
        this.paymentsService.saveInvoice(data.invoice).pipe(
          tap((invoice) =>
            this.snackBar.open(
              'Invoice saved successfully' + invoice.invoiceNumber,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            )
          ), // Log service success
          map((invoice) => invoiceActions.saveInvoiceSuccess({ invoice })),
          catchError((error: HttpErrorResponse) => {
            console.error('Error from saveInvoice:', error); // Log the error
            return of(
              invoiceActions.saveInvoiceFail({
                ...error,
              })
            );
          })
        )
      )
    )
  );

  fetchStudentOutstandingBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(receiptActions.fetchStudentOutstandingBalance),
      switchMap((data) =>
        this.paymentsService
          .getStudentOutstandingBalance(data.studentNumber)
          .pipe(
            map(({ amountDue }) => {
              return receiptActions.fetchStudentOutstandingBalanceSuccess({
                amountDue,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                receiptActions.fetchStudentOutstandingBalanceFail({ ...error })
              )
            )
          )
      )
    )
  );

  fetchReceipts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(receiptActions.fetchReceipts),
      switchMap(() =>
        this.paymentsService.getReceipts().pipe(
          map((receipts) => {
            return receiptActions.fetchReceiptsSuccess({
              receipts,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(receiptActions.fetchReceiptsFail({ ...error }))
          )
        )
      )
    )
  );

  saveReceipt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(receiptActions.saveReceipt),
      switchMap((data) =>
        this.paymentsService
          .saveReceipt(
            data.studentNumber,
            data.amountPaid,
            data.paymentMethod,
            data.description
          )
          .pipe(
            tap((receipt) =>
              this.snackBar.open(
                'Receipt saved successfully' + receipt.receiptNumber,
                'OK',
                {
                  duration: 3000,
                  verticalPosition: 'top',
                  horizontalPosition: 'center',
                }
              )
            ), // Log service success
            map((receipt) => receiptActions.saveReceiptSuccess({ receipt })),
            catchError((error: HttpErrorResponse) => {
              // console.error('Error from saveInvoice:', error); // Log the error
              return of(
                receiptActions.saveReceiptFail({
                  ...error,
                })
              );
            })
          )
      )
    )
  );

  downloadReceipt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(receiptActions.downloadReceiptPdf),
      switchMap((data) =>
        this.paymentsService.downloadReceipt(data.receipt).pipe(
          map(() => receiptActions.downloadReceiptPdfSuccess()),
          catchError((error: HttpErrorResponse) =>
            of(
              receiptActions.downloadReceiptPdfFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );
}
