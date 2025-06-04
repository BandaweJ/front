import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'; // Only need takeUntil from here now
import { MatDialog } from '@angular/material/dialog';

// Import your models and actions
import { ReceiptModel } from '../models/payment.model'; // Assuming payment.model.ts defines ReceiptModel
import { ReceiptFilter } from '../models/receipt-filter.model';
import { FilterReceiptsDialogComponent } from './filter-receipts-dialog/filter-receipts-dialog.component';

// Import your NgRx selectors and actions
import { selectReceipts } from '../store/finance.selector'; // Assuming selectReceipts is correct
import { receiptActions } from '../store/finance.actions'; // Assuming receiptActions.fetchReceipts() is correct
import { ReceiptSummaryCardComponent } from './receipt-item/receipt-summary-card.component/receipt-summary-card.component.component';
import { AddReceiptDialogComponent } from './add-receipt-dialog/add-receipt-dialog.component';
@Component({
  selector: 'app-payments', // Assuming this is your ReceiptsPageComponent
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit, OnDestroy {
  // UI State
  isSearchBarVisible: boolean = false;
  selectedReceipt: ReceiptModel | null = null; // To display the selected receipt in the main component

  // Sorting Options
  sortOptions = [
    { label: 'Date (Newest First)', value: 'paymentDateDesc' },
    { label: 'Date (Oldest First)', value: 'paymentDateAsc' },
    { label: 'Amount (Highest First)', value: 'amountPaidDesc' },
    { label: 'Amount (Lowest First)', value: 'amountPaidAsc' },
    { label: 'Student Name (A-Z)', value: 'studentNameAsc' },
  ];

  // Reactive Streams for Filtering and Sorting
  private currentFiltersSubject = new BehaviorSubject<ReceiptFilter>({});
  currentFilters$ = this.currentFiltersSubject.asObservable(); // Expose as Observable for template/debug

  private currentSortSubject = new BehaviorSubject<string>('paymentDateDesc');
  currentSort$ = this.currentSortSubject.asObservable(); // Expose as Observable for template/debug (e.g. for 'done' icon)

  // Stream of all receipts from the NgRx store
  allReceipts$: Observable<ReceiptModel[]> = this.store.pipe(
    select(selectReceipts)
  );

  // The final observable that combines all receipts, current filters, and current sort
  filteredAndSortedReceipts$: Observable<ReceiptModel[]>;

  private ngUnsubscribe = new Subject<void>(); // For cleaning up subscriptions

  constructor(private dialog: MatDialog, private store: Store) {
    // This is where the magic happens: combine streams to reactively update the list
    this.filteredAndSortedReceipts$ = combineLatest([
      this.allReceipts$,
      this.currentFilters$,
      this.currentSort$,
    ]).pipe(
      // Optional: Add a debounceTime here if filtering/sorting is heavy and you want to prevent UI jank
      // debounceTime(50),
      map(([receipts, filters, sort]) => {
        let processedReceipts = [...receipts]; // Create a copy to avoid mutating store state

        // 1. Apply Filters
        processedReceipts = this.applyFilters(processedReceipts, filters);

        // 2. Apply Sorting
        processedReceipts = this.applySorting(processedReceipts, sort);

        return processedReceipts;
      })
    );
  }

  ngOnInit(): void {
    // Dispatch action to fetch receipts from backend when component initializes
    // This populates the 'allReceipts$' observable from the store.
    this.store.dispatch(receiptActions.fetchReceipts());
  }

  ngOnDestroy(): void {
    // Ensure all subscriptions are unsubscribed to prevent memory leaks
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Toggles the visibility of the search bar.
   * Clears the selected receipt if hiding the search bar.
   */
  toggleSearchBar(): void {
    this.isSearchBarVisible = !this.isSearchBarVisible;
    if (!this.isSearchBarVisible) {
      this.selectedReceipt = null;
    }
  }

  /**
   * Opens the filter dialog and updates the current filters based on dialog result.
   */
  onFilter(): void {
    const dialogRef = this.dialog.open(FilterReceiptsDialogComponent, {
      width: '400px',
      // Pass the current filters' value to the dialog so it can pre-fill
      data: { currentFilters: { ...this.currentFiltersSubject.value } },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result) => {
        // If result is not undefined (dialog wasn't simply dismissed without action)
        if (result !== undefined) {
          this.currentFiltersSubject.next(result); // Update the filter subject
          console.log('Filters applied:', result);
        } else {
          console.log('Filter dialog closed without applying changes.');
        }
      });
  }

  /**
   * Updates the current sort order.
   * @param sortValue The selected sort option value.
   */
  onSortChange(sortValue: string): void {
    this.currentSortSubject.next(sortValue); // Update the sort subject
    console.log('Sort changed to:', sortValue);
  }

  onViewReceiptDetails(receipt: ReceiptModel): void {
    console.log('Viewing details for receipt:', receipt);
    this.selectedReceipt = receipt;
    // TODO: Implement navigation to a detailed receipt view page,
    // or open a MatDialog with full receipt details.
    // Example: this.router.navigate(['/receipts', receipt.id]);
  }

  /**
   * Handler for when a receipt is selected from the SearchReceiptComponent.
   * @param receipt The selected ReceiptModel.
   */
  onReceiptSelectedFromSearch(receipt: ReceiptModel): void {
    this.selectedReceipt = receipt;
    console.log('Receipt selected from search:', receipt);
    this.isSearchBarVisible = false; // Hide search bar after selection
    // TODO: You might want to navigate to the Receipt Details Page here,
    // or display the details prominently on the current page.
    // Example: this.router.navigate(['/receipts', receipt.receiptId]);
  }

  /**
   * Applies filter logic to the given array of receipts.
   * This is a pure function that does not modify the original array.
   * @param receipts The receipts to filter.
   * @param filters The filter criteria.
   * @returns The filtered array of receipts.
   */
  private applyFilters(
    receipts: ReceiptModel[],
    filters: ReceiptFilter
  ): ReceiptModel[] {
    return receipts.filter((receipt) => {
      // Date Range
      if (
        filters.startDate &&
        new Date(receipt.paymentDate) < new Date(filters.startDate)
      )
        return false;
      if (
        filters.endDate &&
        new Date(receipt.paymentDate) > new Date(filters.endDate)
      )
        return false;

      // Student ID (Assuming studentId is the unique identifier for a student)
      if (
        filters.studentNumber &&
        receipt.student.studentNumber !== filters.studentNumber
      )
        return false;

      // Amount Range
      if (
        filters.minAmount !== null &&
        filters.minAmount !== undefined &&
        receipt.amountPaid < filters.minAmount
      )
        return false;
      if (
        filters.maxAmount !== null &&
        filters.maxAmount !== undefined &&
        receipt.amountPaid > filters.maxAmount
      )
        return false;

      // Payment Methods (multi-select)
      if (
        filters.paymentMethods &&
        filters.paymentMethods.length > 0 &&
        !filters.paymentMethods.includes(receipt.paymentMethod)
      )
        return false;

      // Approved Status
      if (
        filters.approved !== null &&
        filters.approved !== undefined &&
        receipt.approved !== filters.approved
      )
        return false;

      // Served By
      if (
        filters.servedBy &&
        !receipt.servedBy
          ?.toLowerCase()
          .includes(filters.servedBy.toLowerCase())
      )
        return false;

      return true; // Keep the receipt if all filters pass
    });
  }

  /**
   * Applies sorting logic to the given array of receipts.
   * This is a pure function that does not modify the original array.
   * @param receipts The receipts to sort.
   * @param sort The sorting criteria.
   * @returns The sorted array of receipts.
   */
  private applySorting(receipts: ReceiptModel[], sort: string): ReceiptModel[] {
    const sortedReceipts = [...receipts]; // Work on a copy to avoid mutating original store data

    switch (sort) {
      case 'paymentDateDesc':
        return sortedReceipts.sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime()
        );
      case 'paymentDateAsc':
        return sortedReceipts.sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime()
        );
      case 'amountPaidDesc':
        return sortedReceipts.sort((a, b) => b.amountPaid - a.amountPaid);
      case 'amountPaidAsc':
        return sortedReceipts.sort((a, b) => a.amountPaid - b.amountPaid);
      case 'studentNameAsc':
        return sortedReceipts.sort((a, b) => {
          const nameA = `${a.student.name} ${a.student.surname}`.toLowerCase();
          const nameB = `${b.student.name} ${b.student.surname}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      default:
        return sortedReceipts; // Default to no specific sort if unrecognized
    }
  }

  /**
   * Opens the "Add New Receipt" dialog.
   */
  onAddReceipt(): void {
    console.log('FAB clicked: Opening Add New Receipt dialog');
    const dialogRef = this.dialog.open(AddReceiptDialogComponent, {
      width: '600px', // Adjust width as needed for your form
      disableClose: true, // Optional: Prevent closing by clicking outside or pressing Escape
      // You can pass data to the dialog here if needed, e.g., default values
      // data: { someInitialValue: '...' }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((receipt) => {
        if (receipt) {
          // 'result' would be the new receipt data if the dialog returned it on success
          this.store.dispatch(receiptActions.saveReceipt({ receipt: receipt }));
          // this.store.dispatch(receiptActions.addReceipt({ receipt: result }));

          // After adding a receipt, you might want to refetch the list
          // or let your NgRx effects handle the store update.
          // For simplicity, if your 'fetchReceipts' reloads everything:
          // this.store.dispatch(receiptActions.fetchReceipts());
        } else {
          console.log('Add New Receipt dialog closed without saving.');
        }
      });
  }
}
