// src/app/finance/reports/student-ledger-report/student-ledger-report.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, Subject, of, EMPTY } from 'rxjs';
import { map, startWith, catchError, tap, takeUntil, filter, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StudentsModel } from 'src/app/registration/models/students.model';
import {
  getStudentLedger,
  LedgerEntry,
  selectIsLoadingFinancials,
  selectErrorMsg,
} from '../../store/finance.selector';
import { selectStudents } from 'src/app/registration/store/registration.selectors';
import { fetchStudents } from 'src/app/registration/store/registration.actions';
import { invoiceActions, receiptActions } from '../../store/finance.actions';
import { StudentSearchComponent } from 'src/app/shared/search-by-student-number/search-by-student-number.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface LedgerSummary {
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
  transactionCount: number;
  oldestTransaction: Date | null;
  newestTransaction: Date | null;
}

@Component({
  selector: 'app-student-ledger-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe,
    StudentSearchComponent,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './student-ledger-report.component.html',
  styleUrls: ['./student-ledger-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLedgerReportComponent implements OnInit, OnDestroy {
  // Student selection
  selectedStudent$ = new Subject<StudentsModel | null>();
  selectedStudent: StudentsModel | null = null;
  
  // Filters
  transactionTypeFilter = new FormControl<string | null>(null);
  startDateFilter = new FormControl<Date | null>(null);
  endDateFilter = new FormControl<Date | null>(null);
  
  // Data observables
  rawLedger$!: Observable<LedgerEntry[]>;
  filteredLedger$!: Observable<LedgerEntry[]>;
  ledgerSummary$!: Observable<LedgerSummary>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  allStudents$: Observable<StudentsModel[]>;
  
  // UI State
  currentTheme: Theme = 'light';
  showFilters = false;
  hasError = false;
  errorMessage = '';
  
  // Table columns
  displayedColumns: string[] = ['date', 'type', 'description', 'amount', 'runningBalance'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.error$ = this.store.select(selectErrorMsg).pipe(
      map(error => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object') {
          const errObj = error as any;
          if ('message' in errObj && errObj.message) {
            return String(errObj.message);
          }
        }
        return String(error);
      }),
      catchError(() => of('An unexpected error occurred'))
    );
    this.allStudents$ = this.store.select(selectStudents);
    
    this.setupDataFlow();
  }

  ngOnInit(): void {
    // Load initial data
    this.store.dispatch(fetchStudents());
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(receiptActions.fetchAllReceipts());

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    // Handle errors with user-friendly messages
    this.error$
      .pipe(
        filter((error): error is string => !!error),
        takeUntil(this.destroy$)
      )
      .subscribe(error => {
        this.hasError = true;
        this.errorMessage = error || 'An error occurred while loading data';
        this.showErrorNotification(error);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDataFlow(): void {
    // Create ledger observable from selected student
    this.rawLedger$ = this.selectedStudent$.pipe(
      switchMap(student => {
        if (!student) {
          return of([]);
        }
        return this.store.select(getStudentLedger(student.studentNumber)).pipe(
          catchError(error => {
            console.error('Error loading ledger:', error);
            this.showErrorNotification('Failed to load ledger data. Please try again.');
            return of([]);
          })
        );
      }),
      map(ledger => ledger || [])
    );

    // Apply filters to ledger
    this.filteredLedger$ = combineLatest([
      this.rawLedger$,
      this.transactionTypeFilter.valueChanges.pipe(startWith(null)),
      this.startDateFilter.valueChanges.pipe(startWith(null)),
      this.endDateFilter.valueChanges.pipe(startWith(null)),
    ]).pipe(
      debounceTime(300),
      map(([ledger, typeFilter, startDate, endDate]) => {
        if (!ledger || ledger.length === 0) return ledger;
        
        return ledger.filter(entry => {
          // Type filter
          if (typeFilter && entry.type !== typeFilter) return false;
          
          // Date filters
          const entryDate = new Date(entry.date);
          if (startDate && entryDate < startDate) return false;
          if (endDate) {
            const endDatePlusOne = new Date(endDate);
            endDatePlusOne.setHours(23, 59, 59, 999);
            if (entryDate > endDatePlusOne) return false;
          }
          
          return true;
        });
      }),
      catchError(error => {
        console.error('Error filtering ledger:', error);
        return this.rawLedger$;
      })
    );

    // Calculate summary statistics
    this.ledgerSummary$ = this.filteredLedger$.pipe(
      map(ledger => {
        if (!ledger || ledger.length === 0) {
          return {
            totalDebits: 0,
            totalCredits: 0,
            netBalance: 0,
            transactionCount: 0,
            oldestTransaction: null,
            newestTransaction: null,
          };
        }

        // Count Invoice types for debits and Payment types for credits
        // Use full payment amounts (money received) to match the running balance calculation
        // This accounts for both allocated amounts and any overpayments (credits)
        const debits = ledger
          .filter(e => e.direction === 'out' && e.type === 'Invoice')
          .reduce((sum, e) => sum + e.amount, 0);
        const credits = ledger
          .filter(e => e.direction === 'in' && e.type === 'Payment')
          .reduce((sum, e) => sum + e.amount, 0);
        const dates = ledger.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
        
        // netBalance = debits - credits (amount owed)
        // Positive value means student owes money, negative means credit balance
        return {
          totalDebits: debits,
          totalCredits: credits,
          netBalance: debits - credits,
          transactionCount: ledger.length,
          oldestTransaction: dates[0] || null,
          newestTransaction: dates[dates.length - 1] || null,
        };
      })
    );
  }

  onStudentSelected(student: StudentsModel | null): void {
    this.selectedStudent = student;
    this.selectedStudent$.next(student);
    this.hasError = false;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    if (student) {
      // Show success message
      this.snackBar.open(
        `Loading ledger for ${student.name} ${student.surname}`,
        'Dismiss',
        { duration: 2000 }
      );
    }
  }

  onRetry(): void {
    this.hasError = false;
    this.errorMessage = '';
    
    if (this.selectedStudent) {
      // Reload data
      this.store.dispatch(invoiceActions.fetchAllInvoices());
      this.store.dispatch(receiptActions.fetchAllReceipts());
      this.selectedStudent$.next(this.selectedStudent);
      
      this.snackBar.open('Retrying...', 'Dismiss', { duration: 2000 });
    }
  }

  onClearFilters(): void {
    this.transactionTypeFilter.setValue(null);
    this.startDateFilter.setValue(null);
    this.endDateFilter.setValue(null);
    this.snackBar.open('Filters cleared', 'Dismiss', { duration: 2000 });
  }

  onExport(): void {
    this.filteredLedger$.pipe(
      takeUntil(this.destroy$),
      map(ledger => {
        if (!ledger || ledger.length === 0) {
          this.snackBar.open('No data to export', 'Dismiss', { duration: 3000 });
          return;
        }

        // Create CSV content
        const headers = ['Date', 'Type', 'Description', 'Amount', 'Running Balance'];
        const rows = ledger.map(entry => [
          new Date(entry.date).toLocaleDateString(),
          entry.type,
          entry.description.replace(/,/g, ';'), // Replace commas to avoid CSV issues
          entry.amount.toFixed(2),
          entry.runningBalance.toFixed(2),
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const student = this.selectedStudent;
        const filename = student
          ? `ledger_${student.studentNumber}_${new Date().toISOString().split('T')[0]}.csv`
          : `ledger_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.snackBar.open('Ledger exported successfully', 'Dismiss', { duration: 3000 });
      })
    ).subscribe();
  }

  onPrint(): void {
    window.print();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    this.cdr.markForCheck();
  }

  private showErrorNotification(message: string): void {
    this.snackBar.open(
      message,
      'Retry',
      {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      }
    ).onAction().subscribe(() => this.onRetry());
  }

  // UI Helper methods
  getTransactionIcon(type: LedgerEntry['type']): string {
    const icons: Record<string, string> = {
      'Payment': 'payments',
      'Invoice': 'description',
      'Allocation': 'check_circle_outline',
    };
    return icons[type] || 'info';
  }

  getTransactionDirectionClass(direction: LedgerEntry['direction']): string {
    return direction === 'in' ? 'amount-in' : 'amount-out';
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'balance-debit';
    if (balance < 0) return 'balance-credit';
    return 'balance-zero';
  }

  getBalanceLabel(balance: number): string {
    if (balance > 0) return 'Amount Owed';
    if (balance < 0) return 'Credit Balance';
    return 'Balance';
  }
}
