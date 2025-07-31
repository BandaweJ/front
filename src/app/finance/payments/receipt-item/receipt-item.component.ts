import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
  OnInit, // Import OnInit
  OnChanges, // Import OnChanges
} from '@angular/core';
import { ReceiptModel } from '../../models/payment.model';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog'; // For dialog reference
import { receiptActions } from '../../store/finance.actions';
import { ReceiptInvoiceAllocationsModel } from '../../models/receipt-invoice-allocations.model';
import { Observable, take } from 'rxjs';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { ConfirmDeleteDialogComponent } from '../../../confirm-delete-dialog/confirm-delete-dialog.component';
import { selectAuthUserRole } from 'src/app/auth/store/auth.selectors';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialo/confirmation-dialo.component';

@Component({
  selector: 'app-receipt-item',
  templateUrl: './receipt-item.component.html',
  styleUrls: ['./receipt-item.component.css'],
})
export class ReceiptItemComponent implements OnInit, OnChanges {
  @Input() receipt!: ReceiptModel;
  @Input() downloadable = false;

  balance = '0.00';
  userRole$!: Observable<ROLES | undefined>; // To get the current user's role

  @ViewChild('receiptContainerRef') receiptContainerRef!: ElementRef;

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    // Get the user's role from the store on init
    this.userRole$ = this.store.select(selectAuthUserRole);
  }

  printReceipt(): void {
    window.print();
  }

  download(): void {
    if (this.receipt && this.receipt.receiptNumber) {
      // Use receiptNumber as per backend
      this.store.dispatch(
        receiptActions.downloadReceiptPdf({
          receiptNumber: this.receipt.receiptNumber,
        })
      );
    } else {
      console.warn(
        'Cannot download receipt: Receipt object or receiptNumber is missing.'
      );
    }
  }

  // --- NEW: VOID RECEIPT METHOD ---
  voidReceipt(): void {
    // Check if the receipt is already voided
    if (this.receipt.isVoided) {
      console.warn('Receipt is already voided. Cannot void again.');
      // Optionally, show a snackbar or message to the user
      return;
    }

    // Open confirmation dialog
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> =
      this.dialog.open(ConfirmationDialogComponent, {
        width: '300px',
        data: {
          title: 'Confirm Void',
          message:
            'Are you sure you want to void this receipt? This action cannot be undone.',
          confirmText: 'Void',
          cancelText: 'Cancel',
        },
      });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          // User confirmed, dispatch the void action
          if (this.receipt && this.receipt.id) {
            this.store.dispatch(
              receiptActions.voidReceipt({ receiptId: this.receipt.id })
            );
          } else {
            console.error('Cannot void receipt: Receipt ID is missing.');
            // Optionally, show a user-friendly error message
          }
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receipt']) {
      const currentReceipt = changes['receipt'].currentValue as ReceiptModel;

      if (
        currentReceipt &&
        currentReceipt.allocations &&
        currentReceipt.allocations.length > 0
      ) {
        const sum = currentReceipt.allocations.reduce(
          (total: number, allocation: ReceiptInvoiceAllocationsModel) => {
            return total + +allocation.invoice.balance;
          },
          0
        );
        this.balance = sum.toFixed(2);
      } else {
        this.balance = '0.00';
      }
    }
  }
}
