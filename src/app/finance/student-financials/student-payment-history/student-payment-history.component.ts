import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PaymentHistoryItem } from '../../models/payment-history.model';
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
})
export class StudentPaymentHistoryComponent implements OnInit, OnDestroy {
  paymentHistory$: Observable<PaymentHistoryItem[] | null>;
  loadingPaymentHistory$: Observable<boolean>;
  errorPaymentHistory$: Observable<any>; // Error from invoices or receipts fetch

  constructor(private store: Store) {
    // Select the combined history directly
    this.paymentHistory$ = this.store.select(selectCombinedPaymentHistory);
    // Loading and error states should reflect the loading/error of invoices/receipts
    this.loadingPaymentHistory$ = this.store.select(
      selectLoadingStudentReceipts
    );
    this.errorPaymentHistory$ = this.store.select(selectLoadStudentReceiptsErr);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

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
}
