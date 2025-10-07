// src/app/finance/components/student-financials-dashboard/student-financials-dashboard.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  selectAmountDue,
  selectErrorMsg,
  selectIsLoadingFinancials,
} from '../../store/finance.selector';
import { receiptActions } from '../../store/finance.actions';
import { User } from 'src/app/auth/models/user.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';

@Component({
  selector: 'app-student-financials-dashboard',
  templateUrl: './student-financials-dashboard.component.html',
  styleUrls: ['./student-financials-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFinancialsDashboardComponent implements OnInit, OnDestroy {
  // UI State
  isLoading = true;
  hasError = false;
  errorMessage = '';
  currentUser: User | null = null;

  // Data Observables
  studentNumber: string | null = null;
  outstandingBalance$: Observable<number | null>;
  loadingOutstandingBalance$: Observable<boolean>;
  outstandingBalanceError$: Observable<any>;
  user$: Observable<User | null>;

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
    private cdr: ChangeDetectorRef
  ) {
    this.user$ = this.store.select(selectUser);
    // Select data from the store
    this.outstandingBalance$ = this.store.select(selectAmountDue);
    this.loadingOutstandingBalance$ = this.store.select(
      selectIsLoadingFinancials
    );
    this.outstandingBalanceError$ = this.store.select(selectErrorMsg);
  }

  ngOnInit(): void {
    this.loadUserData();
    this.setupNavigation();
  }

  loadUserData(): void {
    this.user$
      .pipe(
        filter((user) => !!user),
        tap((user) => {
          if (user) {
            this.currentUser = user;
            this.studentNumber = user.id;
            this.isLoading = false;
            this.cdr.markForCheck();
            
            // Dispatch action to fetch outstanding balance
            this.store.dispatch(
              receiptActions.fetchStudentOutstandingBalance({
                studentNumber: this.studentNumber,
              })
            );
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe({
        error: (error) => this.handleError('Failed to load user data')
      });
  }

  private setupNavigation(): void {
    // Navigate to default tab if no child route is active
    if (this.router.url === '/student-financials' || this.router.url === '/student-financials/') {
      this.router.navigate(['invoices'], { relativeTo: this.route });
    }
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;
    this.cdr.markForCheck();
    console.error(message);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    
    // Clear student financials when leaving the dashboard
    this.store.dispatch(receiptActions.clearStudentFinancials());
  }

  // Helper to determine the active tab based on the current URL
  isLinkActive(linkPath: string): boolean {
    // This logic might need refinement based on your exact routing setup
    return this.router.url.includes(linkPath);
  }
}
