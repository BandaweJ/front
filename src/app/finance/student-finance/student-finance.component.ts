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

    if (!this.legacyBalanceAmount || this.legacyBalanceAmount <= 0) {
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

      if (currentInvoice.balanceBfwd) {
        this.snackBar.open(
          'This invoice already has a balance brought forward attached.',
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

      const amount = this.legacyBalanceAmount;
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
            const invoiceWithLegacy: InvoiceModel = {
              ...currentInvoice,
              balanceBfwd: balance,
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
}
