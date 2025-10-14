import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StudentReceiptsComponent implements OnInit, OnDestroy {
  // Data Observables
  user$ = this.store.select(selectUser);
  receipts$ = this.store.select(selectStudentReceipts);
  loading$ = this.store.select(selectLoadingStudentReceipts);
  error$ = this.store.select(selectLoadStudentReceiptsErr);

  private userSubscription: Subscription | undefined;

  constructor(
    private store: Store
  ) {}

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(
        filter((user): user is User => !!user && !!user.id),
        take(1), // Take only the first emitted studentNumber
        tap((user) => {
          this.store.dispatch(
            receiptActions.fetchStudentReceipts({
              studentNumber: user.id,
            })
          );
        })
      )
      .subscribe({
        error: (error) => console.error('Failed to load receipts:', error)
      });
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
    } else {
      console.warn('Cannot download receipt: Receipt number is missing.');
    }
  }

  // Helper to determine the class for approved/unapproved receipts (optional, for visual cue)
  getApprovalClass(approved: boolean): string {
    return approved ? 'receipt-approved' : 'receipt-unapproved';
  }

  // TrackBy functions for performance
  trackByReceiptId(index: number, receipt: ReceiptModel): string {
    return receipt.receiptNumber;
  }

  trackByAllocationId(index: number, allocation: any): string {
    return allocation.id || index.toString();
  }

  // Helper methods for receipt status
  isReceiptApproved(receipt: ReceiptModel): boolean {
    return receipt.approved;
  }

  isReceiptRecent(receipt: ReceiptModel): boolean {
    const receiptDate = new Date(receipt.paymentDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return receiptDate > sevenDaysAgo;
  }

  getPaymentMethodIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'payments';
      case 'card':
      case 'credit card':
        return 'credit_card';
      case 'bank transfer':
      case 'transfer':
        return 'account_balance';
      case 'check':
        return 'receipt_long';
      default:
        return 'payment';
    }
  }
}
