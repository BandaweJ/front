import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ReceiptModel } from '../../models/payment.model';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { receiptActions } from '../../store/finance.actions';

@Component({
  selector: 'app-receipt-item',
  templateUrl: './receipt-item.component.html',
  styleUrls: ['./receipt-item.component.css'],
})
export class ReceiptItemComponent {
  @Input() receipt!: ReceiptModel;
  @Input() downloadable = false;

  @ViewChild('receiptContainerRef') receiptContainerRef!: ElementRef;

  constructor(private store: Store, private dialog: MatDialog) {}
  ngOnInit(): void {
    // Optional: Add some default or mock data for testing if not provided via Input
  }

  printReceipt(): void {
    window.print(); // Triggers the browser's print dialog
  }

  download() {
    this.store.dispatch(
      receiptActions.downloadReceiptPdf({
        receipt: this.receipt,
      })
    );
  }
}
