import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil, filter, finalize } from 'rxjs/operators';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { invoiceActions } from '../store/finance.actions';
import { InvoiceModel } from '../models/invoice.model';
import {
  selectedStudentInvoice,
  selectFechInvoiceError,
  selectLoadingInvoice,
  selectInvoiceWarning,
} from '../store/finance.selector';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { ThemeService, Theme } from '../../services/theme.service';
import { SharedModule } from '../../shared/shared.module';
import { BillingComponent } from './billing/billing.component';
import { InvoiceItemComponent } from './invoice/invoice-item/invoice-item.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FinanceService } from '../services/finance.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-student-finance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    BillingComponent,
    InvoiceItemComponent,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './student-finance.component.html',
  styleUrls: ['./student-finance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFinanceComponent implements OnInit, OnDestroy {
  // Simple observables from store
  terms$: Observable<TermsModel[]>;
  invoice$: Observable<InvoiceModel | null>;
  loadingInvoice$: Observable<boolean>;
  error$: Observable<string | null>;
  invoiceWarning$: Observable<{ message: string; voidedInvoiceNumber?: string; voidedAt?: Date; voidedBy?: string } | null>;
  
  selectedTerm: TermsModel | null = null;
  selectedStudentNumber: string | null = null;
  selectedStudent: StudentsModel | null = null;

  // UI state for legacy balance (balance brought forward)
  legacyBalanceAmount: number | null = null;
  isSavingWithLegacyBalance = false;

  private destroy$ = new Subject<void>();
  currentTheme: Theme = 'light';

  constructor(
    private store: Store,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private financeService: FinanceService,
    private snackBar: MatSnackBar,
  ) {
    this.terms$ = this.store.select(selectTerms);
    this.invoice$ = this.store.select(selectedStudentInvoice);
    this.loadingInvoice$ = this.store.select(selectLoadingInvoice);
    this.error$ = this.store.select(selectFechInvoiceError);
    this.invoiceWarning$ = this.store.select(selectInvoiceWarning);
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectedStudentChanged(student: StudentsModel): void {
    this.selectedStudent = student;
    this.selectedStudentNumber = student.studentNumber;
  }

  termChanged(term: TermsModel): void {
    this.selectedTerm = term;
  }

         generateInvoice(): void {
           if (
             this.selectedStudentNumber &&
             this.selectedTerm?.num !== undefined &&
             this.selectedTerm?.year !== undefined
           ) {
             this.store.dispatch(
               invoiceActions.fetchInvoice({
                 studentNumber: this.selectedStudentNumber,
                 num: this.selectedTerm.num,
                 year: this.selectedTerm.year,
               })
             );
           }
         }

         saveInvoice(): void {
           // Get the current invoice from the store and save it
           this.invoice$.pipe(take(1)).subscribe(currentInvoice => {
             if (currentInvoice && currentInvoice.invoiceNumber) {
               this.store.dispatch(
                 invoiceActions.saveInvoice({ invoice: currentInvoice })
               );
             } else {
               console.warn('No invoice available to save. Please generate an invoice first.');
             }
           });
         }

  clearSelection(): void {
    this.selectedStudent = null;
    this.selectedStudentNumber = null;
    this.selectedTerm = null;
  }

  isFormValid(): boolean {
    return !!(this.selectedStudentNumber && this.selectedTerm);
  }

  /**
   * Create a legacy balance for the selected student and attach it to the
   * current invoice as balanceBfwd, then save the invoice.
   */
  saveInvoiceWithLegacyBalance(): void {
    if (this.isSavingWithLegacyBalance) {
      return;
    }

    const requestedAmount = Number(this.legacyBalanceAmount);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      this.snackBar.open(
        'Please enter a positive legacy balance amount before saving.',
        'Close',
        { duration: 4000 }
      );
      return;
    }

    this.invoice$.pipe(take(1)).subscribe((currentInvoice) => {
      if (!currentInvoice) {
        this.snackBar.open(
          'No invoice available. Generate an invoice first.',
          'Close',
          { duration: 4000 }
        );
        return;
      }

      const studentNumber =
        currentInvoice.student?.studentNumber || this.selectedStudentNumber;

      if (!studentNumber) {
        this.snackBar.open(
          'Missing student number. Please select a student and try again.',
          'Close',
          { duration: 4000 }
        );
        return;
      }

      const amount = requestedAmount;
      const existingBalance = (currentInvoice as any)?.balanceBfwd;
      const existingBalanceId = Number(existingBalance?.id);
      const existingAmount = this.getExistingBalanceBfwdAmount(currentInvoice);

      // If invoice already has a linked balance, update that same balance value
      // instead of creating another balance row.
      if (existingBalanceId > 0) {
        const invoiceWithLegacy: InvoiceModel = {
          ...currentInvoice,
          balanceBfwd: {
            ...existingBalance,
            id: existingBalanceId,
            amount,
            studentNumber,
          } as any,
        };
        this.store.dispatch(invoiceActions.saveInvoice({ invoice: invoiceWithLegacy }));
        this.snackBar.open(
          existingAmount !== amount
            ? 'Balance brought forward updated and invoice save requested.'
            : 'Balance brought forward is unchanged.',
          'Close',
          { duration: 4000 }
        );
        this.legacyBalanceAmount = null;
        return;
      }

      this.isSavingWithLegacyBalance = true;
      this.cdr.markForCheck();

      this.financeService
        .createFeesBalance({
          amount,
          studentNumber,
        })
        .pipe(
          take(1),
          finalize(() => {
            this.isSavingWithLegacyBalance = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (balance) => {
            // Always persist the amount the user just entered, even if the
            // balance creation endpoint returns a stale/aggregated amount.
            const normalizedBalance = {
              ...balance,
              amount,
              studentNumber,
            };
            const invoiceWithLegacy: InvoiceModel = {
              ...currentInvoice,
              balanceBfwd: normalizedBalance,
            };
            this.store.dispatch(
              invoiceActions.saveInvoice({ invoice: invoiceWithLegacy })
            );
            this.snackBar.open(
              'Legacy balance attached and invoice save requested.',
              'Close',
              { duration: 4000 }
            );
            this.legacyBalanceAmount = null;
          },
          error: (err) => {
            console.error('Failed to create legacy balance', err);
            this.snackBar.open(
              'Failed to create legacy balance. Please try again.',
              'Close',
              { duration: 5000 }
            );
          },
        });
    });
  }

  getExistingBalanceBfwdAmount(invoice: InvoiceModel | null | undefined): number {
    const amountRaw = (invoice as any)?.balanceBfwd?.amount;
    const amount = Number(amountRaw);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }

  canSaveWithLegacyBalance(invoice: InvoiceModel | null | undefined): boolean {
    const requestedAmount = Number(this.legacyBalanceAmount);
    const existingAmount = this.getExistingBalanceBfwdAmount(invoice);
    return (
      !this.isSavingWithLegacyBalance &&
      Number.isFinite(requestedAmount) &&
      requestedAmount > 0 &&
      (existingAmount <= 0 || requestedAmount !== existingAmount)
    );
  }
}
