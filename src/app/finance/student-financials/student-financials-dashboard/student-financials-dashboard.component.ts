// src/app/finance/components/student-financials-dashboard/student-financials-dashboard.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest, Subject } from 'rxjs';
import { filter, tap, takeUntil, map, switchMap, distinctUntilChanged, startWith } from 'rxjs/operators';
import {
  getStudentLedger,
  LedgerEntry,
  selectIsLoading,
  selectAllInvoices,
  selectAllNonVoidedReceipts,
  selectInvoicesAndReceiptsLoaded,
  selectStudentBalance,
  selectStudentInvoicesAndReceiptsLoaded,
} from '../../store/finance.selector';
import {
  invoiceActions,
  receiptActions,
} from '../../store/finance.actions';
import { User } from 'src/app/auth/models/user.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { ThemeService, Theme } from 'src/app/services/theme.service';

@Component({
  selector: 'app-student-financials-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './student-financials-dashboard.component.html',
  styleUrls: ['./student-financials-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFinancialsDashboardComponent implements OnInit, OnDestroy {
  // Data Observables
  user$: Observable<User | null>;
  // Can be null while data is loading
  outstandingBalance$: Observable<number | null>;
  loadingOutstandingBalance$: Observable<boolean>;
  
  // Computed properties
  currentUser$: Observable<User | null>;
  studentNumber$: Observable<string | null>;
  studentName$: Observable<string | null>;
  
  // Theme
  currentTheme: Theme = 'light';

  // Lifecycle Management
  private ngUnsubscribe = new Subject<void>();
  private routeSubscription: Subscription | undefined;

  // Navigation
  navLinks = [
    { 
      label: 'Invoices', 
      path: 'invoices', 
      icon: 'receipt_long',
      description: 'View all your invoices and billing details'
    },
    { 
      label: 'Receipts', 
      path: 'receipts', 
      icon: 'payment',
      description: 'View payment receipts and confirmations'
    },
    { 
      label: 'Payment History', 
      path: 'payment-history', 
      icon: 'history',
      description: 'Track your payment history and transactions'
    },
  ];

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.user$ = this.store.select(selectUser);
    
    // Calculate outstanding balance using student-specific invoices and receipts (more efficient)
    // Data should already be loaded by loadUserData() (dispatches fetchStudentInvoices/fetchStudentReceipts)
    this.outstandingBalance$ = this.user$.pipe(
      filter((user): user is User => !!user && !!user.id),
      switchMap(() => {
        // Use student-specific balance selector (uses studentInvoices and studentReceipts)
        return combineLatest([
          this.store.select(selectStudentBalance),
          this.store.select(selectStudentInvoicesAndReceiptsLoaded).pipe(startWith(false)),
        ]).pipe(
          map(([balance, dataLoaded]) => {
            // If data hasn't loaded yet, return null to show spinner
            if (!dataLoaded) {
              return null;
            }
            // Return the calculated balance (already handles empty case)
            return balance;
          }),
          // Use distinctUntilChanged to prevent unnecessary recalculations
          distinctUntilChanged()
        );
      })
    );
    
    // Loading state: show loading if student invoices/receipts aren't loaded yet
    this.loadingOutstandingBalance$ = this.store.select(selectStudentInvoicesAndReceiptsLoaded).pipe(
      map((dataLoaded) => !dataLoaded),
      startWith(true) // Start with loading state
    );
    
    // Initialize computed properties
    this.currentUser$ = this.user$;
    this.studentNumber$ = this.user$.pipe(
      map(user => user?.id || null)
    );
    
    // Get student name from invoices or receipts in the store
    this.studentName$ = this.user$.pipe(
      filter((user): user is User => !!user && !!user.id),
      switchMap((user) => {
        return combineLatest([
          this.store.select(selectAllInvoices),
          this.store.select(selectAllNonVoidedReceipts)
        ]).pipe(
          map(([invoices, receipts]) => {
            // Try to get student name from invoices first
            const studentInvoice = (invoices || []).find(
              (inv) => inv.student?.studentNumber === user.id
            );
            if (studentInvoice?.student) {
              return `${studentInvoice.student.name} ${studentInvoice.student.surname}`.trim();
            }
            
            // If not found in invoices, try receipts
            const studentReceipt = (receipts || []).find(
              (rec) => rec.student?.studentNumber === user.id
            );
            if (studentReceipt?.student) {
              return `${studentReceipt.student.name} ${studentReceipt.student.surname}`.trim();
            }
            
            return null;
          })
        );
      })
    );
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
    
    this.loadUserData();
    this.setupNavigation();
  }

  loadUserData(): void {
    this.user$
      .pipe(
        filter((user): user is User => !!user && !!user.id),
        tap((user) => {
          // Fetch only this student's invoices and receipts (more efficient than fetching all)
          this.store.dispatch(
            invoiceActions.fetchStudentInvoices({
              studentNumber: user.id,
            })
          );
          this.store.dispatch(
            receiptActions.fetchStudentReceipts({
              studentNumber: user.id,
            })
          );
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe({
        error: (error) => console.error('Failed to load user data:', error)
      });
  }

  private setupNavigation(): void {
    // Navigate to default tab if no child route is active
    if (this.router.url === '/student-financials' || this.router.url === '/student-financials/') {
      this.router.navigate(['invoices'], { relativeTo: this.route });
    }
  }


  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  // Helper to determine the active tab based on the current URL
  isLinkActive(linkPath: string): boolean {
    // This logic might need refinement based on your exact routing setup
    return this.router.url.includes(linkPath);
  }
}
