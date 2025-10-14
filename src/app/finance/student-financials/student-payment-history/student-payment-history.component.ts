import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { PaymentHistoryItem } from '../../models/payment-history.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { User } from 'src/app/auth/models/user.model';
import { receiptActions, invoiceActions } from '../../store/finance.actions';
import {
  selectCombinedPaymentHistory, // This is the new selector we'll create
  selectIsLoadingFinancials,
  selectErrorMsg,
  selectLoadingStudentReceipts,
  selectLoadStudentReceiptsErr,
} from '../../store/finance.selector';

@Component({
  selector: 'app-student-payment-history',
  templateUrl: './student-payment-history.component.html',
  styleUrls: ['./student-payment-history.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StudentPaymentHistoryComponent implements OnInit, OnDestroy {
  // Data Observables
  user$ = this.store.select(selectUser);
  paymentHistory$ = this.store.select(selectCombinedPaymentHistory);
  loading$ = this.store.select(selectLoadingStudentReceipts);
  error$ = this.store.select(selectLoadStudentReceiptsErr);
  
  private userSubscription: Subscription | undefined;

  constructor(
    private store: Store
  ) {}

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(
        filter((user): user is User => !!user && !!user.id),
        take(1),
        tap((user) => {
          // Load both invoices and receipts for payment history
          this.store.dispatch(
            invoiceActions.fetchStudentInvoices({
              studentNumber: user.id,
            })
          );
          this.store.dispatch(
            receiptActions.fetchStudentReceipts({
              studentNumber: user.id,
            })
          );
        })
      )
      .subscribe({
        error: (error) => console.error('Failed to load payment history:', error)
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Helper to get icon based on transaction type
  getTransactionIcon(type: PaymentHistoryItem['type']): string {
    switch (type) {
      case 'Payment':
        return 'receipt'; // Or 'payments'
      case 'Invoice':
        return 'description'; // Or 'assignment'
      case 'Allocation':
        return 'check_circle_outline'; // Or 'link'
      default:
        return 'info';
    }
  }

  // Helper to get color/class based on transaction direction
  getTransactionDirectionClass(
    direction: PaymentHistoryItem['direction']
  ): string {
    return direction === 'in' ? 'amount-in' : 'amount-out';
  }

  // TrackBy functions for performance
  trackByTransactionId(index: number, item: PaymentHistoryItem): string {
    return item.id || `${item.type}-${item.date}-${index}`;
  }

  // Helper methods for transaction status
  isTransactionRecent(item: PaymentHistoryItem): boolean {
    const transactionDate = new Date(item.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return transactionDate > sevenDaysAgo;
  }

  getTransactionStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
      case 'rejected':
        return 'status-failed';
      default:
        return 'status-default';
    }
  }

  getTransactionTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'payment':
        return '#4caf50';
      case 'invoice':
        return '#2196f3';
      case 'allocation':
        return '#ff9800';
      default:
        return '#666';
    }
  }
}
