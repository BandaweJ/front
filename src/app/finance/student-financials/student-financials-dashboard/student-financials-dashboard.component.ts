// src/app/finance/components/student-financials-dashboard/student-financials-dashboard.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
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
})
export class StudentFinancialsDashboardComponent implements OnInit, OnDestroy {
  studentNumber: string | null = null;
  outstandingBalance$: Observable<number | null>;
  loadingOutstandingBalance$: Observable<boolean>;
  outstandingBalanceError$: Observable<any>;
  user$: Observable<User | null>;

  private routeSubscription: Subscription | undefined;

  // Define tab links
  navLinks = [
    { label: 'Invoices', path: 'invoices' },
    { label: 'Receipts', path: 'receipts' },
    { label: 'Payment History', path: 'payment-history' },
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
  }

  ngOnInit(): void {
    // this.user$
    //   .pipe(
    //     filter((user) => !!user),
    //     tap((user) => {
    //       if (user) this.studentNumber = user.id;
    //       if (this.studentNumber) {
    //         // Dispatch action to fetch outstanding balance
    //         this.store.dispatch(
    //           receiptActions.fetchStudentOutstandingBalance({
    //             studentNumber: this.studentNumber,
    //           })
    //         );
    //       }
    //     })
    //   )
    //   .subscribe();

    // Navigate to default tab if no child route is active
    // Navigate to default tab if no specific child route is active
    // This check is more robust when dealing with the base parent URL
    if (
      this.router.url === '/student-financials' ||
      this.router.url === '/student-financials/'
    ) {
      this.router.navigate(['invoices'], { relativeTo: this.route });
    }
  }

  ngOnDestroy(): void {
    // Optionally clear student financials when leaving the dashboard
    this.store.dispatch(receiptActions.clearStudentFinancials());
  }

  // Helper to determine the active tab based on the current URL
  isLinkActive(linkPath: string): boolean {
    // This logic might need refinement based on your exact routing setup
    return this.router.url.includes(linkPath);
  }
}
