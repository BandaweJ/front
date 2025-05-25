import { Component, Input } from '@angular/core';
import { ReceiptModel } from '../../models/payment.model';
import { PaymentMethods } from '../../models/payment-methods.enum';
import { Store } from '@ngrx/store';
import { receiptActions } from '../../store/finance.actions';
import { selectNewReceipt } from '../../store/finance.selector';

@Component({
  selector: 'app-receipt-item',
  templateUrl: './receipt-item.component.html',
  styleUrls: ['./receipt-item.component.css'],
})
export class ReceiptItemComponent {
  @Input() studentNumber!: string;
  receipt$ = this.store.select(selectNewReceipt);

  paymentMethods = [...Object.values(PaymentMethods)];

  constructor(private store: Store) {
    this.store.dispatch(
      receiptActions.fetchNewReceipt({ studentNumber: this.studentNumber })
    );
  }
  ngOnInit(): void {
    // Optional: Add some default or mock data for testing if not provided via Input
  }

  save() {}
}
