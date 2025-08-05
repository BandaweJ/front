import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, Observable, Subscription, take, tap } from 'rxjs';
import { InvoiceModel } from '../../models/invoice.model';
import {
  selectStudentInvoices,
  selectLoadingStudentInvoices,
  selectLoadStudentInvoicesErr,
} from '../../store/finance.selector'; // Assuming these selectors exist or we'll create them
import { invoiceActions } from '../../store/finance.actions';
import { selectUser } from 'src/app/auth/store/auth.selectors';
// import { financeActions, invoiceActions } from '../../store/finance.actions'; // Assuming a financeActions group for invoices

@Component({
  selector: 'app-student-invoices',
  templateUrl: './student-invoices.component.html',
  styleUrls: ['./student-invoices.component.css'],
})
export class StudentInvoicesComponent implements OnInit {
  user$ = this.store.select(selectUser);
  invoices$: Observable<InvoiceModel[] | null>;
  loadingInvoices$: Observable<boolean>;
  errorInvoices$: Observable<any>;
  private userSubscription: Subscription | undefined; // To unsubscribe on destroy

  constructor(private store: Store) {
    this.invoices$ = this.store.select(selectStudentInvoices);
    this.loadingInvoices$ = this.store.select(selectLoadingStudentInvoices); // Reusing general loading selector for now
    this.errorInvoices$ = this.store.select(selectLoadStudentInvoicesErr); // Reusing general error selector for now
  }

  ngOnInit(): void {
    // this.userSubscription = this.store
    //   .select(selectUser)
    //   .pipe(
    //     filter((user) => !!user && !!user.id), // Ensure user and user.id exist
    //     take(1), // <<< THIS IS THE KEY CHANGE: Ensures the tap/dispatch runs only once
    //     tap((user) => {
    //       console.log('student number from store for invoice fetch:', user!.id); // Use user!.id directly
    //       this.store.dispatch(
    //         invoiceActions.fetchStudentInvoices({
    //           studentNumber: user!.id, // Use user.id directly from the tap callback
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
      console.log(`Dispatching download for Invoice #${invoiceNumber}`);
    } else {
      console.warn('Cannot download invoice: Invoice number is missing.');
      // Optionally, show a user-friendly message
    }
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
}
