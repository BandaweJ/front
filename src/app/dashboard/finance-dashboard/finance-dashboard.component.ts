import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
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
import { MatPaginator } from '@angular/material/paginator';

import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { fetchStudents } from 'src/app/registration/store/registration.actions';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css'],
})
export class FinanceDashboardComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  isSearchBarVisible = false;
  private ngUnsubscribe = new Subject<void>();

  private filterSubject = new BehaviorSubject<FinanceFilter>({});
  private sortSubject = new BehaviorSubject<string>('dateDesc');

  invoicesDataSource = new MatTableDataSource<FinanceDataModel>([]);
  paymentsDataSource = new MatTableDataSource<FinanceDataModel>([]);

  // Using setters for the paginators to ensure they are always linked to the data source
  @ViewChild('invoicesPaginator') set invoicesPaginator(
    paginator: MatPaginator
  ) {
    if (paginator) {
      this.invoicesDataSource.paginator = paginator;
    }
  }
  @ViewChild('paymentsPaginator') set paymentsPaginator(
    paginator: MatPaginator
  ) {
    if (paginator) {
      this.paymentsDataSource.paginator = paginator;
    }
  }

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

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

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        min: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Invoices',
        backgroundColor: 'rgba(63, 81, 181, 0.7)',
        borderColor: 'rgba(63, 81, 181, 1)',
        hoverBackgroundColor: 'rgba(63, 81, 181, 0.9)',
        hoverBorderColor: 'rgba(63, 81, 181, 1)',
      },
      {
        data: [],
        label: 'Payments',
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: 'rgba(76, 175, 80, 1)',
        hoverBackgroundColor: 'rgba(76, 175, 80, 0.9)',
        hoverBorderColor: 'rgba(76, 175, 80, 1)',
      },
    ],
  };

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(receiptActions.fetchAllReceipts());
    this.store.dispatch(fetchStudents());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());

    const allData$ = this.store.pipe(select(selectAllCombinedFinanceData));

    allData$
      .pipe(
        map((data) => {
          const monthlyTotals = new Map<
            string,
            { invoices: number; payments: number }
          >();
          data.forEach((item) => {
            const date = new Date(item.transactionDate);
            const monthYear = date.toLocaleString('default', {
              month: 'short',
              year: 'numeric',
            });

            if (!monthlyTotals.has(monthYear)) {
              monthlyTotals.set(monthYear, { invoices: 0, payments: 0 });
            }

            const totals = monthlyTotals.get(monthYear)!;
            if (item.type === 'Invoice') {
              totals.invoices += +item.amount;
            } else {
              totals.payments += +item.amount;
            }
          });

          const sortedKeys = Array.from(monthlyTotals.keys()).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            return dateA.getTime() - dateB.getTime();
          });

          this.barChartData.labels = sortedKeys;
          this.barChartData.datasets[0].data = sortedKeys.map(
            (key) => monthlyTotals.get(key)!.invoices
          );
          this.barChartData.datasets[1].data = sortedKeys.map(
            (key) => monthlyTotals.get(key)!.payments
          );
        }),
        tap(() => {
          if (this.chart) {
            this.chart.update();
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    const filteredAndSortedData$ = combineLatest([
      allData$,
      this.filterSubject.asObservable(),
      this.sortSubject.asObservable(),
    ]).pipe(
      map(([data, filters, sort]) => {
        let filteredData = this.applyFilters(data, filters);
        return this.applySorting(filteredData, sort);
      }),
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

    filteredAndSortedData$.subscribe();

    this.totalInvoices$ = allData$.pipe(
      map((data) =>
        data
          .filter((item) => item.type === 'Invoice')
          .reduce((acc, item) => acc + +item.amount, 0)
      )
    );
    this.totalPayments$ = allData$.pipe(
      map((data) =>
        data
          .filter((item) => item.type === 'Payment')
          .reduce((acc, item) => acc + +item.amount, 0)
      )
    );
    this.totalBalance$ = combineLatest([
      this.totalInvoices$,
      this.totalPayments$,
    ]).pipe(map(([invoices, payments]) => invoices - payments));
  }

  ngAfterViewInit(): void {
    if (this.chart) {
      this.chart.update();
    }
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
