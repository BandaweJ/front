// src/app/finance/components/student-financials-dashboard/student-financials-dashboard.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subscription, Subject, combineLatest } from 'rxjs';
import { filter, tap, takeUntil, take, switchMap, map } from 'rxjs/operators';
import {
  selectStudentInvoices,
  selectStudentReceipts,
} from '../../store/finance.selector';
import {
  invoiceActions,
  receiptActions,
} from '../../store/finance.actions';
import { studentDashboardActions } from 'src/app/dashboard/store/dashboard.actions';
import { selectStudentDashboardSummary } from 'src/app/dashboard/store/dashboard.selectors';
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
  outstandingBalance$: Observable<number>;
  
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

    // Outstanding balance from backend summary (single source of truth)
    this.outstandingBalance$ = this.store.select(selectStudentDashboardSummary).pipe(
      map((summary) => summary?.financialSummary?.amountOwed ?? 0)
    );

    this.currentUser$ = this.user$;
    this.studentNumber$ = this.user$.pipe(
      map(user => user?.id || null)
    );

    // Get student name from student-scoped invoices or receipts (already loaded for this student)
    this.studentName$ = combineLatest([
      this.store.select(selectStudentInvoices),
      this.store.select(selectStudentReceipts),
    ]).pipe(
      map(([invoices, receipts]) => {
        const inv = (invoices || [])[0];
        if (inv?.student) {
          return `${inv.student.name} ${inv.student.surname}`.trim();
        }
        const rec = (receipts || [])[0];
        if (rec?.student) {
          return `${rec.student.name} ${rec.student.surname}`.trim();
        }
        return null;
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
        // Take only the first emission to prevent multiple dispatches
        take(1),
        tap((user) => {
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
          this.store.dispatch(
            studentDashboardActions.fetchStudentDashboardSummary({
              studentNumber: user.id,
            })
          );
        })
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
