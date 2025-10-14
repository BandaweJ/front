// src/app/finance/components/student-financials-dashboard/student-financials-dashboard.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, tap, takeUntil, map } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StudentFinancialsDashboardComponent implements OnInit, OnDestroy {
  // Data Observables
  user$: Observable<User | null>;
  outstandingBalance$: Observable<number | null>;
  loadingOutstandingBalance$: Observable<boolean>;
  outstandingBalanceError$: Observable<any>;
  
  // Computed properties
  currentUser$: Observable<User | null>;
  studentNumber$: Observable<string | null>;

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
    private route: ActivatedRoute
  ) {
    this.user$ = this.store.select(selectUser);
    // Select data from the store
    this.outstandingBalance$ = this.store.select(selectAmountDue);
    this.loadingOutstandingBalance$ = this.store.select(
      selectIsLoadingFinancials
    );
    this.outstandingBalanceError$ = this.store.select(selectErrorMsg);
    
    // Initialize computed properties
    this.currentUser$ = this.user$;
    this.studentNumber$ = this.user$.pipe(
      map(user => user?.id || null)
    );
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
            // Dispatch action to fetch outstanding balance
            this.store.dispatch(
              receiptActions.fetchStudentOutstandingBalance({
                studentNumber: user.id,
              })
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
    
    // Clear student financials when leaving the dashboard
    this.store.dispatch(receiptActions.clearStudentFinancials());
  }

  // Helper to determine the active tab based on the current URL
  isLinkActive(linkPath: string): boolean {
    // This logic might need refinement based on your exact routing setup
    return this.router.url.includes(linkPath);
  }
}
