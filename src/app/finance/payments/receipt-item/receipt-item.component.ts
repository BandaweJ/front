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
import { ReceiptInvoiceAllocationsModel } from '../../models/receipt-invoice-allocations.model';

@Component({
  selector: 'app-receipt-item',
  templateUrl: './receipt-item.component.html',
  styleUrls: ['./receipt-item.component.css'],
})
export class ReceiptItemComponent {
  @Input() receipt!: ReceiptModel;
  @Input() downloadable = false;

  balance = '0.00';

  @ViewChild('receiptContainerRef') receiptContainerRef!: ElementRef;

  constructor(private store: Store, private dialog: MatDialog) {}
  ngOnInit(): void {
    // Optional: Add some default or mock data for testing if not provided via Input
  }

  printReceipt(): void {
    window.print(); // Triggers the browser's print dialog
  }

  download() {
    if (this.receipt && this.receipt.id) {
      this.store.dispatch(
        receiptActions.downloadReceiptPdf({
          receiptNumber: this.receipt.receiptNumber, // Pass only the ID
        })
      );
    } else {
      console.warn('Cannot download receipt: Receipt object or ID is missing.');
      // Optionally, show a user-friendly message
    }
  }

  // ngOnChanges is called whenever any data-bound input property changes.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receipt']) {
      const currentReceipt = changes['receipt'].currentValue as ReceiptModel;

      if (
        currentReceipt &&
        currentReceipt.allocations &&
        currentReceipt.allocations.length > 0
      ) {
        // --- USING NATIVE JAVASCRIPT NUMBER ARITHMETIC ---
        const sum = currentReceipt.allocations.reduce(
          (total: number, allocation: ReceiptInvoiceAllocationsModel) => {
            // Ensure allocation.invoice.balance is converted to a number.
            // If it comes as a string (from DECIMAL DB type), the `+` prefix will convert it.
            return total + +allocation.invoice.balance;
          },
          0 // Start the sum with a native JS number 0
        );

        // Format the result to 2 decimal places as a string for display
        this.balance = sum.toFixed(2);
      } else {
        // If no receipt or no allocations, reset the balance to 0
        this.balance = '0.00';
      }
    }
  }
}
