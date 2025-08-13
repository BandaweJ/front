import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  tap,
} from 'rxjs';
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
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css'],
})
export class FinanceDashboardComponent implements OnInit, OnDestroy {
  isSearchBarVisible = false;
  private ngUnsubscribe = new Subject<void>();

  private filterSubject = new BehaviorSubject<FinanceFilter>({});
  private sortSubject = new BehaviorSubject<string>('dateDesc');

  invoicesDataSource = new MatTableDataSource<FinanceDataModel>([]);
  paymentsDataSource = new MatTableDataSource<FinanceDataModel>([]);

  totalInvoices$!: Observable<number>;
  totalPayments$!: Observable<number>;
  totalBalance$!: Observable<number>;

  currentSort$ = this.sortSubject.asObservable();
  sortOptions = [
    { label: 'Date (Newest)', value: 'dateDesc' },
    { label: 'Date (Oldest)', value: 'dateAsc' },
    { label: 'Amount (Highest)', value: 'amountDesc' },
    { label: 'Amount (Lowest)', value: 'amountAsc' },
    { label: 'Type (A-Z)', value: 'typeAsc' },
  ];

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(receiptActions.fetchAllReceipts());
    this.store.dispatch(invoiceActions.fetchAllInvoices());

    const allData$ = this.store.pipe(select(selectAllCombinedFinanceData));

    const filteredAndSortedData$ = combineLatest([
      allData$,
      this.filterSubject.asObservable(),
      this.sortSubject.asObservable(),
    ]).pipe(
      map(([data, filters, sort]) => {
        let filteredData = this.applyFilters(data, filters);
        return this.applySorting(filteredData, sort);
      }),
      // Use tap to update the MatTableDataSource instances
      tap((data) => {
        this.invoicesDataSource.data = data.filter(
          (item) => item.type === 'Invoice'
        );
        this.paymentsDataSource.data = data.filter(
          (item) => item.type === 'Payment'
        );
      }),
      takeUntil(this.ngUnsubscribe)
    );

    // This subscription is now necessary to trigger the observable stream
    filteredAndSortedData$.subscribe();

    // Summary calculations remain the same
    this.totalInvoices$ = allData$.pipe(
      map((data) =>
        data
          .filter((item) => item.type === 'Invoice')
          .reduce((acc, item) => acc + item.amount, 0)
      )
    );
    this.totalPayments$ = allData$.pipe(
      map((data) =>
        data
          .filter((item) => item.type === 'Payment')
          .reduce((acc, item) => acc + item.amount, 0)
      )
    );
    this.totalBalance$ = combineLatest([
      this.totalInvoices$,
      this.totalPayments$,
    ]).pipe(map(([invoices, payments]) => invoices - payments));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleSearchBar(): void {
    this.isSearchBarVisible = !this.isSearchBarVisible;
  }

  onFinancialEntitySelectedFromSearch(entity: FinanceDataModel): void {
    this.filterSubject.next({ studentId: entity.studentId });
  }

  onFilter(): void {
    const dialogRef = this.dialog.open(FilterFinanceDialogComponent, {
      width: '400px',
      data: this.filterSubject.value,
    });

    dialogRef.afterClosed().subscribe((result: FinanceFilter) => {
      if (result) {
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
      if (filters.transactionType && item.type !== filters.transactionType)
        return false;
      if (
        filters.startDate &&
        new Date(item.date) < new Date(filters.startDate)
      )
        return false;
      if (filters.endDate && new Date(item.date) > new Date(filters.endDate))
        return false;
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
