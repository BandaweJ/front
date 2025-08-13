import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReceiptModel } from 'src/app/finance/models/payment.model';

@Component({
  selector: 'app-receipt-summary-card',
  templateUrl: './receipt-summary-card.component.component.html',
  styleUrls: ['./receipt-summary-card.component.component.css'],
})
export class ReceiptSummaryCardComponent {
  @Input() receipt!: ReceiptModel;
  @Output() viewDetails = new EventEmitter<ReceiptModel>();
}
