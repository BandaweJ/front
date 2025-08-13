import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import {
  selectStudentReceipts, // We'll create this selector
  selectLoadStudentReceiptsErr, // Reusing general error state
} from '../../store/finance.selector';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { User } from 'src/app/auth/models/user.model';
import { receiptActions } from '../../store/finance.actions';
import { selectLoadingStudentReceipts } from '../../store/finance.selector';
import { ReceiptModel } from '../../models/payment.model';

@Component({
  selector: 'app-student-receipts',
  templateUrl: './student-receipts.component.html',
  styleUrls: ['./student-receipts.component.css'],
})
export class StudentReceiptsComponent implements OnInit, OnDestroy {
  receipts$: Observable<ReceiptModel[] | null>;
  loadingReceipts$: Observable<boolean>;
  errorReceipts$: Observable<any>;

  private userSubscription: Subscription | undefined;

  constructor(private store: Store) {
    this.receipts$ = this.store.select(selectStudentReceipts);
    this.loadingReceipts$ = this.store.select(selectLoadingStudentReceipts);
    this.errorReceipts$ = this.store.select(selectLoadStudentReceiptsErr);
  }

  ngOnInit(): void {
    // Fetch studentNumber from the store and dispatch action to load receipts
    // this.userSubscription = this.store
    //   .select(selectUser)
    //   .pipe(
    //     filter((user): user is User => !!user && !!user.id),
    //     take(1), // Take only the first emitted studentNumber
    //     tap((user) => {
    //       this.store.dispatch(
    //         receiptActions.fetchStudentReceipts({
    //           studentNumber: user.id,
    //         })
    //       );
    //     })
    //   )
    //   .subscribe();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    // Optionally, dispatch an action to clear receipts from the store when leaving
    // this.store.dispatch(financeActions.clearStudentReceipts());
  }

  /**
   * Dispatches an action to download a specific receipt PDF.
   * @param receiptNumber The unique identifier for the receipt to download.
   */
  downloadReceipt(receiptNumber: string): void {
    if (receiptNumber) {
      this.store.dispatch(
        receiptActions.downloadReceiptPdf({ receiptNumber: receiptNumber })
      );
      console.log(`Dispatching download for Receipt #${receiptNumber}`);
    } else {
      console.warn('Cannot download receipt: Receipt number is missing.');
    }
  }

  // Helper to determine the class for approved/unapproved receipts (optional, for visual cue)
  getApprovalClass(approved: boolean): string {
    return approved ? 'receipt-approved' : 'receipt-unapproved';
  }
}
