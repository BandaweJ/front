import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

// Adjust imports for your new financial models and filter types
// You'll need to define FinanceDataModel and FinanceFilter models
import { FinanceDataModel } from '../../finance/models/finance-data.model'; // Define this model for general financial data
import { FinanceFilter } from '../../finance/models/finance-filter.model'; // Define this model for dashboard filters
import { FilterFinanceDialogComponent } from './filter-finance-dialog/filter-finance-dialog.component'; // New dialog for finance filters

// Adjust NgRx selectors and actions for general finance data
import { selectAllCombinedFinanceData } from 'src/app/finance/store/finance.selector';
import {
  invoiceActions,
  receiptActions,
} from 'src/app/finance/store/finance.actions';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import { fetchStudents } from 'src/app/registration/store/registration.actions';

// You might have a generic search component if you need to search for students, invoices, etc.
// import { SearchFinanceEntityComponent } from './search-finance-entity/search-finance-entity.component';

@Component({
  selector: 'app-finance-dashboard', // New selector for the dashboard
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css'],
})
export class FinanceDashboardComponent implements OnInit, OnDestroy {
  // UI State
  isSearchBarVisible: boolean = false;
  selectedFinancialEntity: FinanceDataModel | null = null; // To display selected item from search or details

  // Sorting Options for broad financial data
  // These will need to be refined based on what you display (e.g., by date, amount, type, student name)
  sortOptions = [
    { label: 'Date (Newest First)', value: 'dateDesc' },
    { label: 'Date (Oldest First)', value: 'dateAsc' },
    { label: 'Amount (Highest First)', value: 'amountDesc' },
    { label: 'Amount (Lowest First)', value: 'amountAsc' },
    { label: 'Type (A-Z)', value: 'typeAsc' }, // e.g., Revenue vs. Expense
  ];

  // Reactive Streams for Filtering and Sorting
  private currentFiltersSubject = new BehaviorSubject<FinanceFilter>({});
  currentFilters$ = this.currentFiltersSubject.asObservable();

  private currentSortSubject = new BehaviorSubject<string>('dateDesc');
  currentSort$ = this.currentSortSubject.asObservable();

  // Stream of all finance data from the NgRx store
  // This needs to fetch a broader set of financial data than just receipts
  allFinanceData$: Observable<FinanceDataModel[]> = this.store.pipe(
    select(selectAllCombinedFinanceData) // Make sure this selector fetches comprehensive finance data
  );

  // The final observable that combines all finance data, current filters, and current sort
  filteredAndSortedFinancialData$: Observable<FinanceDataModel[]>;

  private ngUnsubscribe = new Subject<void>();

  constructor(private dialog: MatDialog, private store: Store) {
    this.filteredAndSortedFinancialData$ = combineLatest([
      this.allFinanceData$,
      this.currentFilters$,
      this.currentSort$,
    ]).pipe(
      // debounceTime(50), // Consider if needed for performance
      map(([data, filters, sort]) => {
        let processedData = [...data];

        // 1. Apply Filters
        processedData = this.applyFilters(processedData, filters);

        // 2. Apply Sorting
        processedData = this.applySorting(processedData, sort);

        return processedData;
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(receiptActions.fetchAllReceipts());
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(fetchTerms()); // Fetch terms as well if needed
    this.store.dispatch(fetchStudents());
    this.store.dispatch(fetchClasses());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Toggles the visibility of the search bar.
   */
  toggleSearchBar(): void {
    this.isSearchBarVisible = !this.isSearchBarVisible;
    if (!this.isSearchBarVisible) {
      this.selectedFinancialEntity = null; // Clear selected entity if search bar is hidden
    }
  }

  /**
   * Opens a date range picker dialog (or integrates one directly).
   * For the dashboard, a simple date range is often the first filter applied.
   */
  openDateRangePicker(): void {
    // Implement or open a specific dialog for date range selection
    // For example, using MatDatepicker in a dialog
    console.log('Opening date range picker for dashboard.');
    // You could open a dialog similar to FilterReceiptsDialogComponent,
    // but specifically for date ranges, and then update currentFiltersSubject.
    // Or integrate <mat-date-range-input> directly if space allows.
  }

  /**
   * Opens the general filter dialog for financial data.
   */
  onFilter(): void {
    const dialogRef = this.dialog.open(FilterFinanceDialogComponent, {
      width: '450px', // Adjust width as needed for broader financial filters
      data: { currentFilters: { ...this.currentFiltersSubject.value } },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result) => {
        if (result !== undefined) {
          this.currentFiltersSubject.next(result); // Update the filter subject
          console.log('Finance Filters applied:', result);
        } else {
          console.log('Finance filter dialog closed without applying changes.');
        }
      });
  }

  /**
   * Updates the current sort order.
   * @param sortValue The selected sort option value.
   */
  onSortChange(sortValue: string): void {
    this.currentSortSubject.next(sortValue);
    console.log('Finance Dashboard sort changed to:', sortValue);
  }

  /**
   * Clears all applied filters and resets the sort to default.
   */
  onClearFilters(): void {
    this.currentFiltersSubject.next({}); // Reset filters to empty object
    this.currentSortSubject.next('dateDesc'); // Reset sort to default
    this.isSearchBarVisible = false; // Hide search bar as well
    this.selectedFinancialEntity = null; // Clear any selected entity
    console.log('All finance dashboard filters cleared.');
  }

  /**
   * Handler for when a financial entity is selected from a generic search component.
   * @param entity The selected FinanceDataModel (e.g., an invoice, a student's balance).
   */
  onFinancialEntitySelectedFromSearch(entity: FinanceDataModel): void {
    this.selectedFinancialEntity = entity;
    console.log('Financial entity selected from search:', entity);
    this.isSearchBarVisible = false; // Hide search bar after selection
    // TODO: Determine how to display this selected entity (e.g., navigate, show details panel)
  }

  /**
   * Placeholder: Applies filter logic for general financial data.
   * This function will need to be much more generic than the receipt one.
   * @param data The financial data to filter.
   * @param filters The filter criteria.
   * @returns The filtered array of financial data.
   */
  private applyFilters(
    data: FinanceDataModel[],
    filters: FinanceFilter
  ): FinanceDataModel[] {
    // This is where you'll implement filtering based on FinanceFilter properties
    // Examples: date ranges, transaction types (revenue/expense), student/staff IDs,
    // budget categories, payment statuses (paid/overdue), etc.
    return data.filter((item) => {
      // Example filters (you'll need to define these in FinanceFilter model and implement logic)
      if (
        filters.startDate &&
        new Date(item.transactionDate) < new Date(filters.startDate)
      )
        return false;
      if (
        filters.endDate &&
        new Date(item.transactionDate) > new Date(filters.endDate)
      )
        return false;

      if (filters.transactionType && item.type !== filters.transactionType)
        return false; // e.g., 'Revenue', 'Expense'
      if (filters.studentId && item.studentId !== filters.studentId)
        return false;
      if (filters.minAmount && item.amount < filters.minAmount) return false;
      if (filters.maxAmount && item.amount > filters.maxAmount) return false;
      // ... add more filtering logic based on your FinanceFilter model

      return true;
    });
  }

  /**
   * Placeholder: Applies sorting logic for general financial data.
   * This function will also need to be more generic.
   * @param data The financial data to sort.
   * @param sort The sorting criteria.
   * @returns The sorted array of financial data.
   */
  private applySorting(
    data: FinanceDataModel[],
    sort: string
  ): FinanceDataModel[] {
    const sortedData = [...data];

    switch (sort) {
      case 'dateDesc':
        return sortedData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case 'dateAsc':
        return sortedData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case 'amountDesc':
        return sortedData.sort((a, b) => b.amount - a.amount);
      case 'amountAsc':
        return sortedData.sort((a, b) => a.amount - b.amount);
      case 'typeAsc':
        return sortedData.sort((a, b) => a.type.localeCompare(b.type));
      // ... add more sorting logic
      default:
        return sortedData;
    }
  }

  // No specific 'Add Receipt' FAB here, as the dashboard is for viewing.
  // If you need a general 'Add Financial Entry' button, uncomment the FAB in HTML
  // and implement a generic dialog/navigation for adding various financial records.
}
