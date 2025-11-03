// src/app/finance/components/student-financials-dashboard/student-financials-dashboard.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest, Subject } from 'rxjs';
import { filter, tap, takeUntil, map, switchMap, startWith } from 'rxjs/operators';
import {
  getStudentLedger,
  LedgerEntry,
  selectIsLoading,
  selectAllInvoices,
  selectAllNonVoidedReceipts,
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
    
    // Calculate outstanding balance from store using ledger selector (single source of truth)
    // Wait for data to be loaded before calculating to avoid race conditions
    this.outstandingBalance$ = this.user$.pipe(
      filter((user): user is User => !!user && !!user.id),
      switchMap((user) => {
        // Combine loading state with data to ensure we wait for data to load
        return combineLatest([
          this.store.select(selectIsLoading),
          this.store.select(selectAllInvoices),
          this.store.select(selectAllNonVoidedReceipts),
          this.store.select(getStudentLedger(user.id)),
        ]).pipe(
          // Only calculate if not loading (wait for fetch to complete)
          filter(([isLoading]) => !isLoading),
          map(([_, __, ___, ledger]: [boolean, any, any, LedgerEntry[]]) => {
            if (!ledger || ledger.length === 0) {
              return 0;
            }
            // Return the running balance from the last ledger entry
            return ledger[ledger.length - 1].runningBalance;
          }),
          // Start with null to indicate loading state
          startWith(null as number | null)
        );
      })
    );
    
    // Loading state: use general loading state (tracks invoices and receipts)
    this.loadingOutstandingBalance$ = this.store.select(selectIsLoading);
    
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
        filter((user) => !!user),
        tap((user) => {
          if (user) {
            // Ensure invoices and receipts are loaded for ledger calculation
            this.store.dispatch(
              invoiceActions.fetchAllInvoices()
            );
            this.store.dispatch(
              receiptActions.fetchAllReceipts()
            );
          }
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
