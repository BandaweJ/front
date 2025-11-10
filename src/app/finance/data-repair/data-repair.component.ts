import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PaymentsService } from '../services/payments.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface AuditResult {
  invoicesWithBalanceIssues: Array<{
    invoiceId: number;
    invoiceNumber: string;
    studentNumber: string;
    expectedBalance: number;
    actualBalance: number;
    difference: number;
  }>;
  invoicesWithMissingCreditAllocations: Array<{
    invoiceId: number;
    invoiceNumber: string;
    studentNumber: string;
    amountPaidOnInvoice: number;
    totalReceiptAllocations: number;
    missingCreditAmount: number;
  }>;
  voidedReceiptsWithIncompleteReversals: Array<{
    receiptId: number;
    receiptNumber: string;
    studentNumber: string;
    amountPaid: number;
    totalAllocations: number;
    shouldHaveReversed: number;
  }>;
  invoicesWithDeletedBalanceBfwd: Array<{
    invoiceId: number;
    invoiceNumber: string;
    studentNumber: string;
    balanceId: number | null;
    totalBill: number;
    calculatedTotalBill: number;
    possibleBalanceBfwdAmount: number;
    note: string;
  }>;
  summary: {
    totalInvoices: number;
    invoicesWithIssues: number;
    totalReceipts: number;
    voidedReceiptsWithIssues: number;
    invoicesWithDeletedBalanceBfwd: number;
  };
}

interface RepairResult {
  fixed: number;
  errors: number;
  details: Array<any>;
}

@Component({
  selector: 'app-data-repair',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './data-repair.component.html',
  styleUrls: ['./data-repair.component.scss'],
})
export class DataRepairComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  auditResult: AuditResult | null = null;
  verificationResult: any = null;
  repairReport: any = null;
  loadingAudit = false;
  loadingVerification = false;
  loadingReport = false;
  loadingRepair = false;
  dryRun = true;

  displayedColumnsBalance = [
    'invoiceNumber',
    'studentNumber',
    'expectedBalance',
    'actualBalance',
    'difference',
  ];
  displayedColumnsCredit = [
    'invoiceNumber',
    'studentNumber',
    'amountPaidOnInvoice',
    'totalReceiptAllocations',
    'missingCreditAmount',
  ];
  displayedColumnsVoided = [
    'receiptNumber',
    'studentNumber',
    'amountPaid',
    'totalAllocations',
    'shouldHaveReversed',
  ];
  displayedColumnsDeletedBalanceBfwd = [
    'invoiceNumber',
    'studentNumber',
    'totalBill',
    'calculatedTotalBill',
    'possibleBalanceBfwdAmount',
  ];

  constructor(
    private paymentsService: PaymentsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runAudit(): void {
    this.loadingAudit = true;
    this.paymentsService
      .auditDataIntegrity()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.auditResult = result;
          this.loadingAudit = false;
          this.snackBar.open('Audit completed successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.loadingAudit = false;
          this.snackBar.open(
            `Error running audit: ${error.message}`,
            'Close',
            { duration: 5000 }
          );
        },
      });
  }

  repairBalances(): void {
    this.loadingRepair = true;
    this.paymentsService
      .repairInvoiceBalances(this.dryRun)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: RepairResult) => {
          this.loadingRepair = false;
          const message = this.dryRun
            ? `Would fix ${result.fixed} invoice balances (dry run)`
            : `Fixed ${result.fixed} invoice balances`;
          this.snackBar.open(message, 'Close', { duration: 5000 });
          if (!this.dryRun) {
            this.runAudit(); // Refresh audit after repair
          }
        },
        error: (error) => {
          this.loadingRepair = false;
          this.snackBar.open(
            `Error repairing balances: ${error.message}`,
            'Close',
            { duration: 5000 }
          );
        },
      });
  }

  repairVoidedReceipts(): void {
    this.loadingRepair = true;
    this.paymentsService
      .repairVoidedReceipts(this.dryRun)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: RepairResult) => {
          this.loadingRepair = false;
          const message = this.dryRun
            ? `Would fix ${result.fixed} voided receipts (dry run)`
            : `Fixed ${result.fixed} voided receipts`;
          this.snackBar.open(message, 'Close', { duration: 5000 });
          if (!this.dryRun) {
            this.runAudit(); // Refresh audit after repair
          }
        },
        error: (error) => {
          this.loadingRepair = false;
          this.snackBar.open(
            `Error repairing voided receipts: ${error.message}`,
            'Close',
            { duration: 5000 }
          );
        },
      });
  }

  repairAll(): void {
    this.loadingRepair = true;
    this.paymentsService
      .repairAllData(this.dryRun)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.loadingRepair = false;
          const balanceFixed = result.balanceRepairs?.fixed || 0;
          const voidedFixed = result.voidedReceiptRepairs?.fixed || 0;
          const creditAllocFixed = result.missingCreditAllocationRepairs?.fixed || 0;
          const message = this.dryRun
            ? `Would fix ${balanceFixed} balances, ${voidedFixed} voided receipts, and ${creditAllocFixed} missing credit allocations (dry run)`
            : `Fixed ${balanceFixed} balances, ${voidedFixed} voided receipts, and ${creditAllocFixed} missing credit allocations`;
          this.snackBar.open(message, 'Close', { duration: 5000 });
          if (!this.dryRun) {
            this.auditResult = result.audit; // Update audit result
          }
        },
        error: (error) => {
          this.loadingRepair = false;
          this.snackBar.open(
            `Error repairing data: ${error.message}`,
            'Close',
            { duration: 5000 }
          );
        },
      });
  }

  verifyAmountPaid(): void {
    this.loadingVerification = true;
    this.verificationResult = null;
    this.paymentsService
      .verifyAmountPaidOnInvoice()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.verificationResult = result;
          this.loadingVerification = false;
          this.snackBar.open(
            `Verification completed: Found ${result.summary.invoicesWithMismatches} invoices with mismatches`,
            'Close',
            { duration: 5000 }
          );
        },
        error: (error) => {
          this.loadingVerification = false;
          this.snackBar.open(
            `Error verifying amount paid: ${error.message}`,
            'Close',
            { duration: 5000 }
          );
        },
      });
  }

  generateReport(): void {
    this.loadingReport = true;
    this.repairReport = null;
    this.paymentsService
      .generateRepairReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.repairReport = result;
          this.loadingReport = false;
          this.snackBar.open(
            `Repair report generated: ${result.summary.totalIssues} issues found`,
            'Close',
            { duration: 5000 }
          );
        },
        error: (error) => {
          this.loadingReport = false;
          this.snackBar.open(
            `Error generating report: ${error.message}`,
            'Close',
            { duration: 5000 }
          );
        },
      });
  }
}

