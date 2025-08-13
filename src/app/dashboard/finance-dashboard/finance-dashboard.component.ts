import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FinanceDataModel } from '../../finance/models/finance-data.model';
import { FinanceFilter } from '../../finance/models/finance-filter.model';
import { FilterFinanceDialogComponent } from './filter-finance-dialog/filter-finance-dialog.component';
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

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css'],
})
export class FinanceDashboardComponent implements OnInit, OnDestroy {
  isSearchBarVisible = false;
  private ngUnsubscribe = new Subject<void>();

  // Use a BehaviorSubject for the filters so it always has a value
  private filterSubject = new BehaviorSubject<FinanceFilter>({});
  private sortSubject = new BehaviorSubject<string>('dateDesc');

  // Combined observable for filtered and sorted data
  filteredAndSortedFinancialData$!: Observable<FinanceDataModel[]>;
  currentSort$ = this.sortSubject.asObservable();

  // Define your sorting options
  sortOptions = [
    { label: 'Date (Newest)', value: 'dateDesc' },
    { label: 'Date (Oldest)', value: 'dateAsc' },
    { label: 'Amount (Highest)', value: 'amountDesc' },
    { label: 'Amount (Lowest)', value: 'amountAsc' },
    { label: 'Type (A-Z)', value: 'typeAsc' },
  ];

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    // Dispatch actions to fetch all necessary data
    this.store.dispatch(receiptActions.fetchAllReceipts());
    this.store.dispatch(invoiceActions.fetchAllInvoices());

    // Combine the data, filters, and sorting into one stream
    this.filteredAndSortedFinancialData$ = combineLatest([
      this.store.pipe(select(selectAllCombinedFinanceData)),
      this.filterSubject.asObservable(),
      this.sortSubject.asObservable(),
    ]).pipe(
      map(([data, filters, sort]) => {
        // Apply filtering first
        let filteredData = this.applyFilters(data, filters);
        // Then apply sorting
        return this.applySorting(filteredData, sort);
      }),
      takeUntil(this.ngUnsubscribe)
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleSearchBar(): void {
    this.isSearchBarVisible = !this.isSearchBarVisible;
  }

  onFinancialEntitySelectedFromSearch(entity: FinanceDataModel): void {
    // Implement logic for when a user selects an entity from the search bar.
    // e.g., navigate to a details page or highlight the item.
    console.log('Selected financial entity:', entity);
    // For now, we'll just filter the view to show only this item.
    this.filterSubject.next({ studentId: entity.studentId });
  }

  onFilter(): void {
    const dialogRef = this.dialog.open(FilterFinanceDialogComponent, {
      width: '400px',
      data: this.filterSubject.value,
    });

    dialogRef.afterClosed().subscribe((result: FinanceFilter) => {
      if (result) {
        // A new filter was applied, update the subject
        this.filterSubject.next(result);
      }
    });
  }

  onClearFilters(): void {
    this.filterSubject.next({});
    this.sortSubject.next('dateDesc');
  }

  onSortChange(sortValue: string): void {
    this.sortSubject.next(sortValue);
  }

  private applyFilters(
    data: FinanceDataModel[],
    filters: FinanceFilter
  ): FinanceDataModel[] {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }
    return data.filter((item) => {
      // Logic for filtering
      if (filters.transactionType && item.type !== filters.transactionType) {
        return false;
      }
      if (
        filters.startDate &&
        new Date(item.date) < new Date(filters.startDate)
      ) {
        return false;
      }
      if (filters.endDate && new Date(item.date) > new Date(filters.endDate)) {
        return false;
      }
      if (filters.minAmount && item.amount < filters.minAmount) return false;
      if (filters.maxAmount && item.amount > filters.maxAmount) return false;

      return true;
    });
  }

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
      default:
        return sortedData;
    }
  }
}
