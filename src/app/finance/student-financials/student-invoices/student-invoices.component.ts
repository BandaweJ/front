import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, Observable, Subscription, take, tap } from 'rxjs';
import { InvoiceModel } from '../../models/invoice.model';
import { invoiceActions } from '../../store/finance.actions';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { selectStudentInvoices, selectLoadingStudentInvoices, selectLoadStudentInvoicesErr } from '../../store/finance.selector';

@Component({
  selector: 'app-student-invoices',
  templateUrl: './student-invoices.component.html',
  styleUrls: ['./student-invoices.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StudentInvoicesComponent implements OnInit, OnDestroy {
  // Data Observables
  user$ = this.store.select(selectUser);
  invoices$ = this.store.select(selectStudentInvoices);
  loading$ = this.store.select(selectLoadingStudentInvoices);
  error$ = this.store.select(selectLoadStudentInvoicesErr);
  private userSubscription: Subscription | undefined;

  constructor(
    private store: Store<any>
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(
        filter((user) => !!user && !!user.id),
        take(1),
        tap((user) => {
          this.store.dispatch(
            invoiceActions.fetchStudentInvoices({
              studentNumber: user!.id,
            })
          );
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error loading invoices:', error);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // TrackBy functions for performance
  trackByInvoiceId(index: number, invoice: InvoiceModel): string {
    return invoice.invoiceNumber;
  }

  trackByBillId(index: number, bill: any): string {
    return bill.fees.id;
  }

  trackByAllocationId(index: number, allocation: any): string {
    return allocation.receiptId;
  }

  // Helper methods for invoice status
  isInvoiceOverdue(invoice: InvoiceModel): boolean {
    const today = new Date();
    const dueDate = new Date(invoice.invoiceDueDate);
    return dueDate < today && invoice.balance > 0;
  }

  isInvoicePaid(invoice: InvoiceModel): boolean {
    return invoice.balance <= 0;
  }

  // Helper to get invoice status class for styling
  getInvoiceStatusClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'status-paid';
      case 'Partially Paid':
        return 'status-partially-paid';
      case 'Overdue':
        return 'status-overdue';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  /**
   * Dispatches an action to download a specific invoice PDF.
   * @param invoiceNumber The unique identifier for the invoice to download.
   */
  downloadInvoice(invoiceNumber: string): void {
    if (invoiceNumber) {
      this.store.dispatch(
        invoiceActions.downloadInvoice({ invoiceNumber: invoiceNumber })
      );
    } else {
      console.warn('Cannot download invoice: Invoice number is missing.');
      // Optionally, show a user-friendly message
    }
  }

}
