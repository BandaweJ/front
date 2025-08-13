// src/app/finance/reports/student-ledger-report/student-ledger-report.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StudentsModel } from 'src/app/registration/models/students.model';
// Import the factory function:
import {
  getStudentLedger,
  LedgerEntry,
  selectIsLoadingFinancials,
  selectErrorMsg,
} from '../../store/finance.selector';
import { selectStudents } from 'src/app/registration/store/registration.selectors';
import { fetchStudents } from 'src/app/registration/store/registration.actions';
import { invoiceActions, receiptActions } from '../../store/finance.actions';

@Component({
  selector: 'app-student-ledger-report',
  templateUrl: './student-ledger-report.component.html',
  styleUrls: ['./student-ledger-report.component.css'],
})
export class StudentLedgerReportComponent implements OnInit, OnDestroy {
  selectedStudent: StudentsModel | null = null;
  studentLedger$: Observable<LedgerEntry[] | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<any>;
  allStudents$: Observable<StudentsModel[]>;

  private ledgerSubscription: Subscription | undefined;
  private studentSelectionSubscription: Subscription | undefined;

  constructor(private store: Store) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.error$ = this.store.select(selectErrorMsg);
    this.allStudents$ = this.store.select(selectStudents);

    // Initialize with an empty observable, will be re-assigned on student selection
    this.studentLedger$ = new Observable<LedgerEntry[] | null>();
  }

  ngOnInit(): void {
    this.store.dispatch(fetchStudents());
  }

  ngOnDestroy(): void {
    if (this.studentSelectionSubscription) {
      this.studentSelectionSubscription.unsubscribe();
    }
    if (this.ledgerSubscription) {
      this.ledgerSubscription.unsubscribe();
    }
  }

  onStudentSelected(student: StudentsModel): void {
    this.selectedStudent = student;

    if (this.ledgerSubscription) {
      this.ledgerSubscription.unsubscribe();
    }

    // *** IMPORTANT CHANGE HERE ***
    // Call the selector factory with the studentNumber to get the specific selector
    this.studentLedger$ = this.store
      .select(getStudentLedger(student.studentNumber))
      .pipe(
        tap((ledger) => {
          if (ledger && ledger.length > 0) {
          } else {
          }
        })
      );

    this.ledgerSubscription = this.studentLedger$.subscribe();
  }

  // ... rest of your component methods (getTransactionIcon, getTransactionDirectionClass, getBalanceClass)
  getTransactionIcon(type: LedgerEntry['type']): string {
    switch (type) {
      case 'Payment':
        return 'payments';
      case 'Invoice':
        return 'description';
      case 'Allocation':
        return 'check_circle_outline';
      default:
        return 'info';
    }
  }

  getTransactionDirectionClass(direction: LedgerEntry['direction']): string {
    return direction === 'in' ? 'amount-in' : 'amount-out';
  }

  getBalanceClass(balance: number): string {
    return balance > 0
      ? 'balance-debit'
      : balance < 0
      ? 'balance-credit'
      : 'balance-zero';
  }
}
