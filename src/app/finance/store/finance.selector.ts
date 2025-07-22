import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFinanceReducer from './finance.reducer';
import { InvoiceModel } from '../models/invoice.model';
import { ReceiptModel } from '../models/payment.model';
import { PaymentHistoryItem } from '../models/payment-history.model';
import { PaymentMethods } from '../enums/payment-methods.enum';
import {
  selectClasses,
  selectTermEnrols,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { FinanceDataModel } from '../models/finance-data.model';
import {
  OutstandingFeesReportData,
  OutstandingFeesReportFilters,
  OutstandingStudentDetail,
} from '../models/outstanding-fees.model';
import { selectStudents } from 'src/app/registration/store/registration.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import {
  AgedDebtorsReportData,
  AgedDebtorsReportFilters,
  AgedInvoiceSummary,
} from '../models/aged-debtors-report.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import {
  RevenueRecognitionReportData,
  RevenueRecognitionReportFilters,
  RevenueRecognitionSummary,
} from '../models/revenue-recognition-report.model';
import {
  EnrollmentBillingReportData,
  EnrollmentBillingReportDetail,
  EnrollmentBillingReportFilters,
  EnrollmentBillingReportSummary,
} from '../models/enrollment-billing-reconciliation-report.model';
export const financeState =
  createFeatureSelector<fromFinanceReducer.State>('finance');

export const selectCurrentExemption = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.exemption
);

export const selectExemptionsLoading = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.exemptionLoading
);

export const selectExemptionsError = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.exemptionError
);

export const selectFees = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.fees
);

export const selectIsLoading = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.isLoading
);

export const selectErrorMsg = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.errorMessage
);

export const selectStudentsToBill = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.studentsToBill
);

export const selectedStudentInvoice = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.selectedStudentInvoice
);

export const selectIsNewComer = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.isNewComer
);

export const selectInVoiceStats = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.invoiceStats
);

export const selectTermInvoices = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.termInvoices
);

export const selectAllInvoices = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.allInvoices
);

export const selectCreatedReceipt = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.createdReceipt
);

export const selectAmountDue = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.studentOutstandingBalance
);

export const selectAllReceipts = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.allReceipts
);

export const selectIsLoadingFinancials = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.isLoadingStudentBalance
);

export const selectFechInvoiceError = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.fetchInvoiceError
);

export const selectStudentInvoices = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.studentInvoices
);

export const selectStudentReceipts = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.studentReceipts
);

export const selectLoadingStudentInvoices = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.loadingStudentInvoices
);

export const selectLoadingStudentReceipts = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.loadingStudentReceipts
);

export const selectLoadStudentInvoicesErr = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.loadStudentInvoicesErr
);

export const selectLoadStudentReceiptsErr = createSelector(
  financeState,
  (state: fromFinanceReducer.State) => state.loadStudentReceiptsErr
);

// NEW: Selector to combine invoices and receipts into a chronological payment history
export const selectCombinedPaymentHistory = createSelector(
  selectStudentInvoices,
  selectStudentReceipts,
  (
    invoices: InvoiceModel[] | null,
    receipts: ReceiptModel[] | null
  ): PaymentHistoryItem[] => {
    const history: PaymentHistoryItem[] = [];

    // 1. Add Invoices as 'debits' or 'charges'
    if (invoices) {
      invoices.forEach((invoice) => {
        history.push({
          id: `INV-${invoice.invoiceNumber}`, // Unique ID for this history item
          type: 'Invoice',
          date: new Date(invoice.invoiceDate),
          description: `Invoice #${invoice.invoiceNumber} for ${invoice.enrol.name} (${invoice.enrol.year})`,
          amount: invoice.totalBill,
          direction: 'out', // Outgoing financial obligation
          relatedDocNumber: invoice.invoiceNumber,
          status: invoice.status,
        });
      });
    }

    // 2. Add Receipts as 'payments received'
    if (receipts) {
      receipts.forEach((receipt) => {
        history.push({
          id: `REC-${receipt.receiptNumber}`, // Unique ID for this history item
          type: 'Payment',
          date: new Date(receipt.paymentDate),
          description: `Payment by ${receipt.paymentMethod}`,
          amount: receipt.amountPaid,
          direction: 'in', // Incoming payment
          relatedDocNumber: receipt.receiptNumber,
          paymentMethod: receipt.paymentMethod,
          status: receipt.approved ? 'Approved' : 'Pending Approval',
        });

        // 3. Add Allocations from Receipts as separate events if desired
        //    This provides more granular detail on which invoices were affected by a payment.
        if (receipt.allocations) {
          receipt.allocations.forEach((allocation) => {
            history.push({
              id: `ALLOC-${allocation.receiptId}-${allocation.invoice.invoiceNumber}`, // Unique ID
              type: 'Allocation',
              date: new Date(allocation.allocationDate),
              description: `Payment of ${allocation.amountApplied} 'applied to Invoice #'${allocation.invoice.invoiceNumber} from Receipt #${receipt.receiptNumber}`,
              amount: allocation.amountApplied,
              direction: 'in', // This allocation reduced an outgoing debt
              relatedDocNumber: allocation.invoice.invoiceNumber, // Point to the invoice
            });
          });
        }
      });
    }

    // Sort the history chronologically (newest first for a "history" view, or oldest first)
    // Let's sort oldest first (ascending date) for a historical timeline
    history.sort((a, b) => a.date.getTime() - b.date.getTime());

    return history;
  }
);

// --- Student Ledger Report Specific Selectors ---
export interface LedgerEntry extends PaymentHistoryItem {
  runningBalance: number; // Add running balance to each entry
}

export const getStudentLedger = (studentNumber: string) =>
  createSelector(
    selectAllInvoices,
    selectAllReceipts,
    (
      allInvoices: InvoiceModel[] | null,
      allReceipts: ReceiptModel[] | null
    ): LedgerEntry[] => {
      if (!studentNumber || (!allInvoices && !allReceipts)) {
        return [];
      }

      const ledgerEntries: PaymentHistoryItem[] = [];

      // Filter invoices for the specific student
      const studentInvoices = (allInvoices || []).filter(
        (inv) => inv.student.studentNumber === studentNumber
      );

      // Filter receipts for the specific student
      const studentReceipts = (allReceipts || []).filter(
        (rec) => rec.student.studentNumber === studentNumber
      );

      // 1. Process Invoices (Debit entries)
      studentInvoices.forEach((invoice) => {
        // --- MODIFICATION HERE ---
        let termInfo = '';
        // Check if termNum exists before adding "Term X"
        if (invoice.enrol.num && invoice.enrol.year) {
          termInfo = ` (Term ${invoice.enrol.num}, ${invoice.enrol.year})`;
        } else if (invoice.enrol.year) {
          // Fallback to just the year if termNum is missing
          termInfo = ` (${invoice.enrol.year})`;
        }

        ledgerEntries.push({
          id: `INV-${invoice.id}`,
          type: 'Invoice',
          date: new Date(invoice.invoiceDate),
          // Construct the new description
          description: `Invoice #${invoice.invoiceNumber} for ${invoice.enrol.name}${termInfo}`,
          amount: +invoice.totalBill, // Keep the parseFloat fix
          direction: 'out',
          relatedDocNumber: invoice.invoiceNumber,
          status: invoice.status,
        });
      });

      // 2. Process Receipts and their Allocations
      studentReceipts.forEach((receipt) => {
        // Add the main payment entry
        ledgerEntries.push({
          id: `REC-${receipt.id}`,
          type: 'Payment',
          date: new Date(receipt.paymentDate),
          description: `Payment received by ${receipt.paymentMethod}`,
          // --- FIX: Convert to number here ---
          amount: +receipt.amountPaid,
          direction: 'in',
          relatedDocNumber: receipt.receiptNumber,
          paymentMethod: receipt.paymentMethod,
          status: receipt.approved ? 'Approved' : 'Pending Approval',
        });

        // Add allocations as separate entries for detailed history
        receipt.allocations.forEach((allocation) => {
          ledgerEntries.push({
            id: `ALLOC-${allocation.id}`,
            type: 'Allocation',
            date: new Date(allocation.allocationDate),
            description: `Allocated from Receipt #${receipt.receiptNumber} to Invoice #${allocation.invoice.invoiceNumber}`,
            // --- FIX: Convert to number here ---
            amount: +allocation.amountApplied,
            direction: 'in',
            relatedDocNumber: allocation.invoice.invoiceNumber,
          });
        });
      });

      // 3. Sort all entries chronologically
      ledgerEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

      // 4. Calculate running balance (logic already corrected in previous iteration)
      let currentRunningBalance = 0;
      const ledgerWithRunningBalance: LedgerEntry[] = ledgerEntries.map(
        (entry) => {
          if (entry.type === 'Invoice') {
            currentRunningBalance += entry.amount;
          } else if (entry.type === 'Payment') {
            currentRunningBalance -= entry.amount;
          }
          // Allocation entries do not change the running balance
          return { ...entry, runningBalance: currentRunningBalance };
        }
      );

      return ledgerWithRunningBalance;
    }
  );

// --- Fees Collection Report Specific Models ---
// Re-define these if they were in a separate file, or ensure they are here
export interface PaymentMethodBreakdown {
  method: PaymentMethods;
  total: number;
}

export interface EnrolmentCollectionBreakdown {
  enrolName: string;
  total: number;
}

export interface FeeTypeCollectionBreakdown {
  feeName: string;
  total: number;
}

// Filters interface for the Fees Collection Report
export interface FeesCollectionReportFilters {
  startDate?: Date | null;
  endDate?: Date | null;
  termId?: number | null; // If filtering by specific term
  year?: number | null; // If filtering by specific year (optional, can be derived from term)
}

// This factory function will return a memoized selector based on the provided filters.
export const getFeesCollectionReport = (filters: FeesCollectionReportFilters) =>
  createSelector(
    selectAllReceipts,
    selectAllInvoices,
    selectTerms, // Needed to resolve term-based dates
    (
      allReceipts: ReceiptModel[] | null,
      allInvoices: InvoiceModel[] | null,
      allTerms: TermsModel[] | null
    ) => {
      if (!allReceipts || allReceipts.length === 0) {
        return {
          summaryByMethod: new Map<PaymentMethods, number>(),
          summaryByEnrol: new Map<string, number>(),
          summaryByFeeType: new Map<string, number>(),
          totalCollection: 0,
        };
      }

      let reportStartDate: Date | null = filters.startDate || null;
      let reportEndDate: Date | null = filters.endDate || null;

      // If a term is selected, override start/end dates
      if (
        filters.termId !== undefined &&
        filters.termId !== null &&
        allTerms &&
        allTerms.length > 0
      ) {
        // More robust check for termId presence
        // Ensure t.num and filters.termId are treated as numbers for comparison
        const selectedTerm = allTerms.find(
          (t) => Number(t.num) === Number(filters.termId)
        );
        if (selectedTerm) {
          reportStartDate = selectedTerm.startDate
            ? new Date(selectedTerm.startDate)
            : null;
          reportEndDate = selectedTerm.endDate
            ? new Date(selectedTerm.endDate)
            : null;
          // Set hours to ensure full day range if dates are just YYYY-MM-DD
          if (reportStartDate) reportStartDate.setHours(0, 0, 0, 0);
          if (reportEndDate) reportEndDate.setHours(23, 59, 59, 999);
        } else {
        }
      } else {
      }

      // Validate dates
      if (reportStartDate && isNaN(reportStartDate.getTime())) {
        reportStartDate = null;
      }
      if (reportEndDate && isNaN(reportEndDate.getTime())) {
        reportEndDate = null;
      }

      // === MODIFICATION START ===
      // Skipping the 'approved' filter. All receipts in allReceipts will be processed from this point.
      let filteredReceipts = [...allReceipts]; // Create a shallow copy to avoid modifying original array

      // === MODIFICATION END ===

      // Apply date filtering if dates are set
      if (reportStartDate && reportEndDate) {
        const startTimestamp = reportStartDate.getTime();
        const endTimestamp = reportEndDate.getTime();

        filteredReceipts = filteredReceipts.filter((receipt) => {
          const paymentDate = new Date(receipt.paymentDate);
          if (isNaN(paymentDate.getTime())) {
            return false; // Filter out receipts with invalid dates
          }
          const paymentTime = paymentDate.getTime();
          // Ensure payment date falls within the inclusive range
          const isInDateRange =
            paymentTime >= startTimestamp && paymentTime <= endTimestamp;
          if (!isInDateRange) {
          }
          return isInDateRange;
        });
      } else {
      }

      const summaryByMethod = new Map<PaymentMethods, number>();
      const summaryByEnrol = new Map<string, number>();
      const summaryByFeeType = new Map<string, number>();
      let totalCollection = 0;

      filteredReceipts.forEach((receipt) => {
        const amountForCollection = Number(receipt.amountPaid);
        if (
          typeof amountForCollection !== 'number' ||
          amountForCollection <= 0
        ) {
          return; // Skip if amountPaid is not a valid positive number
        }

        // Aggregate by Payment Method
        const currentMethodTotal =
          summaryByMethod.get(receipt.paymentMethod) || 0;
        summaryByMethod.set(
          receipt.paymentMethod,
          currentMethodTotal + amountForCollection
        );
        totalCollection += amountForCollection;

        // Aggregate by Enrolment and Fee Type via allocations
        if (!receipt.allocations || receipt.allocations.length === 0) {
        }

        receipt.allocations.forEach((allocation, index) => {
          if (!allocation.invoice || !allocation.invoice.id) {
            return;
          }
          // Ensure the invoice associated with the allocation is available and valid
          const invoice = (allInvoices || []).find(
            (inv) => inv.id === allocation.invoice.id
          );

          if (invoice) {
            // Aggregate by Enrolment
            const enrolName = invoice.enrol?.name;
            if (enrolName) {
              // Ensure currentEnrolTotal is treated as a number.
              // The || 0 handles the first time an enrolment is encountered.
              const currentEnrolTotal = Number(
                summaryByEnrol.get(enrolName) || 0
              );

              // Ensure allocation.amountApplied is also treated as a number
              const amountToApply = Number(allocation.amountApplied);

              // Add robust check for NaN after conversion
              if (!isNaN(amountToApply)) {
                summaryByEnrol.set(
                  enrolName,
                  currentEnrolTotal + amountToApply
                );
              } else {
              }
            } else {
            }

            // Aggregate by Fee Type (more robust proportional allocation)
            if (invoice.bills && invoice.bills.length > 0) {
              const totalBillAmountInInvoice = invoice.totalBill; // This should be the sum of all bill amounts in the invoice

              // Only proceed if there's a total bill amount to avoid division by zero
              if (totalBillAmountInInvoice && totalBillAmountInInvoice > 0) {
                invoice.bills.forEach((bill) => {
                  const feeName = bill.fees?.name; // Assuming bill.fees.name exists and is correct
                  if (
                    feeName &&
                    bill.fees?.amount !== undefined &&
                    bill.fees.amount !== null
                  ) {
                    // Calculate the proportional amount applied to this specific fee based on its bill amount
                    const proportionalAllocation =
                      (bill.fees.amount / totalBillAmountInInvoice) *
                      allocation.amountApplied;
                    const currentFeeTotal = summaryByFeeType.get(feeName) || 0;
                    summaryByFeeType.set(
                      feeName,
                      currentFeeTotal + proportionalAllocation
                    );
                  } else {
                  }
                });
              } else {
              }
            } else {
            }
          } else {
          }
        });
      });

      return {
        summaryByMethod, // Map for direct use in component if desired, or convert to array
        summaryByEnrol, // Map
        summaryByFeeType, // Map
        totalCollection,
      };
    }
  );

// -------End Fees Collection Report -------------------//

// === NEW: Selector to combine Invoices and Receipts into FinanceDataModel[] ===
export const selectAllCombinedFinanceData = createSelector(
  selectAllInvoices,
  selectAllReceipts,
  (invoices: InvoiceModel[], receipts: ReceiptModel[]): FinanceDataModel[] => {
    const combined: FinanceDataModel[] = [];

    // Map Invoices to FinanceDataModel
    if (invoices) {
      invoices.forEach((invoice) => {
        combined.push({
          id: invoice.invoiceNumber,
          transactionDate: invoice.invoiceDate, // Use this for consistent date sorting/filtering
          amount: invoice.totalBill, // Or whatever amount represents the total for the invoice in FinanceDataModel
          type: 'Invoice',
          description: `Term ${invoice.enrol.num} ${invoice.enrol.year} Invoice For ${invoice.student.surname} ${invoice.student.name} Enrolled in ${invoice.enrol.name} as a ${invoice.enrol.residence}`,
          date: invoice.invoiceDate,
          studentId: invoice.student.studentNumber,
          studentName: invoice.student.surname + invoice.student.name,
          status: invoice.status,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          invoiceDueDate: invoice.invoiceDueDate,
          invoiceTotalBill: invoice.totalBill,
          invoiceBalance: invoice.balance,
          enrolId: invoice.enrol.id,
          enrolAcademicYear: invoice.enrol.year,
          enrolTerm: invoice.enrol.num + ' ' + invoice.enrol.year,
          enrolClass: invoice.enrol.name,
        });
      });
    }

    // Map Receipts to FinanceDataModel
    if (receipts) {
      receipts.forEach((receipt) => {
        combined.push({
          id: receipt.receiptNumber,
          transactionDate: receipt.paymentDate,
          amount: receipt.amountPaid, // Use receiptAmountPaid for receipts
          type: 'Payment',
          description: receipt.description, // Assuming description exists on receipt for dashboard view
          date: receipt.paymentDate,
          studentId: receipt.student.studentNumber,
          studentName: receipt.student.surname + ' ' + receipt.student.name,
          status: 'Approved', // Receipt status (e.g., 'Approved', 'Pending')
          receiptNumber: receipt.receiptNumber,
          paymentMethod: receipt.paymentMethod,
          receiptAmountPaid: receipt.amountPaid,
          // receiptAmountDueBeforePayment: receipt.receiptAmountDueBeforePayment,
          // receiptAmountOutstandingAfterPayment: receipt.receiptAmountOutstandingAfterPayment,
          receiptApproved: receipt.approved,
          receiptServedBy: receipt.servedBy,
        });
      });
    }

    // Sort the combined array by date (newest first) by default
    return combined.sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    );
  }
);

// Helper function to calculate a student's total outstanding balance
// This function assumes combinedTransactions are already sorted by date.
export const calculateStudentOverallBalance = (
  studentNumber: string,
  allCombinedTransactions: FinanceDataModel[]
): number => {
  let balance = 0;
  const studentTransactions = allCombinedTransactions
    .filter((t) => t.studentId === studentNumber)
    .sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime()
    ); // Ensure chronological sort

  studentTransactions.forEach((t) => {
    // Ensure amount is parsed as a number
    const amount = parseFloat(String(t.amount)) || 0;

    if (t.type === 'Invoice') {
      balance += amount; // Invoices increase outstanding
    } else if (t.type === 'Payment') {
      balance -= amount; // Payments decrease outstanding
    }
    // Add logic for other transaction types if necessary (e.g., credit notes, adjustments)
  });
  return balance;
};

// === NEW: Selector to get ALL student overall outstanding balances ===
// This is a more efficient way to get all balances once,
// rather than recalculating for each student in the report selectors.
export const selectAllStudentsOverallBalances = createSelector(
  selectAllCombinedFinanceData,
  (combinedData: FinanceDataModel[]) => {
    const studentBalances = new Map<string, number>();

    const sortedCombinedData = combinedData.sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime()
    );

    sortedCombinedData.forEach((t) => {
      const studentId = t.studentId;
      if (!studentId) return; // Skip if no studentId

      let currentBalance = studentBalances.get(studentId) || 0;
      const amount = parseFloat(String(t.amount)) || 0;

      if (t.type === 'Invoice') {
        currentBalance += amount;
      } else if (t.type === 'Payment') {
        currentBalance -= amount;
      }
      // Add other transaction types if applicable

      studentBalances.set(studentId, currentBalance);
    });

    return studentBalances; // Returns a Map: studentNumber -> current_overall_balance
  }
);

// === UPDATED: Outstanding Fees Report Selector Factory ===
export const getOutstandingFeesReport = (
  filters: OutstandingFeesReportFilters
) =>
  createSelector(
    selectAllInvoices, // Still needed for filtering by class/term (enrolment details)
    selectStudents,
    selectTerms,
    selectAllStudentsOverallBalances, // NEW: Inject the calculated overall balances
    (
      allInvoices: InvoiceModel[] | null,
      allStudents: StudentsModel[] | null,
      allTerms: TermsModel[] | null,
      studentOverallBalances: Map<string, number> // NEW: Get the map of balances
    ): OutstandingFeesReportData => {
      const studentsMap = new Map<string, StudentsModel>();
      (allStudents || []).forEach((s) => studentsMap.set(s.studentNumber, s));

      // Re-initialize aggregations to use the *overall* student balances
      let totalOverallOutstanding = 0;
      const outstandingByClass = new Map<string, number>();
      const outstandingByResidence = new Map<string, number>();

      const allStudentBalancesAggregated: {
        [studentNumber: string]: {
          overallOutstanding: number; // Renamed to clearly indicate overall
          student: StudentsModel | undefined;
          enrolName: string | undefined;
          residence: string | undefined;
        };
      } = {};

      // First, populate allStudentBalancesAggregated from the pre-calculated overall balances
      // and associate student/enrolment details
      studentOverallBalances.forEach((balance, studentNumber) => {
        if (balance > 0) {
          // Only consider students with an actual outstanding balance
          const student = studentsMap.get(studentNumber);
          // To get enrolName and residence, we need to find an associated invoice or enrolment.
          // This assumes a student usually has a primary enrolment for the current period,
          // or we can pick the most recent relevant invoice's enrolment details.
          // For simplicity, let's find one active invoice for the student to get these details.
          // A more robust solution might involve a separate 'student enrolments' selector.
          const relevantInvoice = (allInvoices || []).find(
            (inv) =>
              inv.student?.studentNumber === studentNumber && inv.balance > 0
          );

          if (student) {
            allStudentBalancesAggregated[studentNumber] = {
              overallOutstanding: balance,
              student: student,
              enrolName: relevantInvoice?.enrol?.name || 'N/A', // Get from relevant invoice/enrol
              residence: relevantInvoice?.enrol?.residence || 'N/A', // Get from relevant invoice/enrol
            };
            totalOverallOutstanding += balance; // Sum up the overall balances
          }
        }
      });

      // Now, iterate through the aggregated students to sum up by class and residence
      Object.values(allStudentBalancesAggregated).forEach((data) => {
        if (data.overallOutstanding > 0) {
          // Only aggregate if outstanding
          // Aggregate by Class Name
          if (data.enrolName) {
            const currentClassTotal =
              outstandingByClass.get(data.enrolName) || 0;
            outstandingByClass.set(
              data.enrolName,
              currentClassTotal + data.overallOutstanding
            );
          }

          // Aggregate by Residence
          if (data.residence && data.residence.trim() !== '') {
            const currentResidenceTotal =
              outstandingByResidence.get(data.residence) || 0;
            outstandingByResidence.set(
              data.residence,
              currentResidenceTotal + data.overallOutstanding
            );
          }
        }
      });

      // --- Date and Term Filtering for Student Details List ---
      // This part remains tricky if you want to filter by term *date range*
      // AND show the *overall* balance. The overall balance isn't tied to a specific invoice date.
      // If the report is "Outstanding Fees for Students in Term X", it should show their
      // CURRENT overall balance, but *only* for students who were enrolled/invoiced in Term X.

      // Revised logic for studentDetails to reflect overall outstanding, filtered by term/class/residence
      let studentDetails: OutstandingStudentDetail[] = Object.values(
        allStudentBalancesAggregated
      )
        .map((data) => ({
          studentNumber: data.student?.studentNumber || '',
          studentName: `${data.student?.name || ''} ${
            data.student?.surname || ''
          }`.trim(),
          enrolName: data.enrolName || '',
          residence: data.residence || '',
          totalOutstanding: data.overallOutstanding, // Use the overall balance
        }))
        .filter((s) => s.totalOutstanding > 0); // Only include students with a positive balance

      // Apply filters for student details (these filters now apply to the aggregated student data)
      if (filters.enrolmentName) {
        studentDetails = studentDetails.filter(
          (s) => s.enrolName === filters.enrolmentName
        );
      }
      if (filters.residence) {
        studentDetails = studentDetails.filter(
          (s) => s.residence === filters.residence
        );
      }
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const searchTerm = filters.searchQuery.toLowerCase().trim();
        studentDetails = studentDetails.filter(
          (student) =>
            student.studentName.toLowerCase().includes(searchTerm) ||
            student.studentNumber.toLowerCase().includes(searchTerm)
        );
      }

      // If a term filter is applied, further filter `studentDetails` to include only students
      // who had *any* invoice within that term. This ensures that the overall outstanding
      // balance is displayed only for students relevant to the selected term.
      if (
        filters.termId !== undefined &&
        filters.termId !== null &&
        allTerms &&
        allTerms.length > 0
      ) {
        const [filterNumStr, filterYearStr] = filters.termId.split('-');
        const filterNum = parseInt(filterNumStr, 10);
        const filterYear = parseInt(filterYearStr, 10);

        const selectedTerm = allTerms.find(
          (t) => t.num === filterNum && t.year === filterYear
        );

        if (selectedTerm) {
          const studentsInvoicesInTerm = new Set<string>();
          (allInvoices || []).forEach((invoice) => {
            if (
              invoice.enrol?.num === selectedTerm.num &&
              invoice.enrol?.year === selectedTerm.year
            ) {
              studentsInvoicesInTerm.add(invoice.student?.studentNumber || '');
            }
          });
          studentDetails = studentDetails.filter((s) =>
            studentsInvoicesInTerm.has(s.studentNumber)
          );
        }
      }

      studentDetails.sort((a, b) => a.studentName.localeCompare(b.studentName));

      // Recalculate overall and class/residence totals based on the *filtered* studentDetails
      // if you want the summaries to reflect the filters. Otherwise, they reflect *all* outstanding.
      // For consistency with studentDetails, recalculating is usually preferred.
      totalOverallOutstanding = studentDetails.reduce(
        (sum, s) => sum + s.totalOutstanding,
        0
      );

      const summaryByEnrolmentMap = new Map<string, number>();
      const summaryByResidenceMap = new Map<string, number>();

      studentDetails.forEach((s) => {
        if (s.enrolName) {
          summaryByEnrolmentMap.set(
            s.enrolName,
            (summaryByEnrolmentMap.get(s.enrolName) || 0) + s.totalOutstanding
          );
        }
        if (s.residence) {
          summaryByResidenceMap.set(
            s.residence,
            (summaryByResidenceMap.get(s.residence) || 0) + s.totalOutstanding
          );
        }
      });

      return {
        totalOverallOutstanding: totalOverallOutstanding,
        summaryByEnrolment: summaryByEnrolmentMap,
        summaryByResidence: summaryByResidenceMap,
        studentDetails,
      };
    }
  );

// -----------Aged debts report selector -------------------------//
// Helper function to get the difference in days between two dates
function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1).setHours(0, 0, 0, 0); // Normalize to start of day
  const d2 = new Date(date2).setHours(0, 0, 0, 0); // Normalize to start of day
  const diffTime = d1 - d2; // Milliseconds difference
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
}

// Helper selector to find a specific term by its num and year (used for filtering)
const getSelectedTermForAgedReport = (filters: AgedDebtorsReportFilters) =>
  createSelector(
    selectTerms, // Assuming selectAllTerms is available
    (allTerms: TermsModel[] | null) => {
      if (!filters.termId || !allTerms || allTerms.length === 0) {
        return null; // No term selected or no terms available
      }
      const [numStr, yearStr] = filters.termId.split('-');
      const num = parseInt(numStr, 10);
      const year = parseInt(yearStr, 10);
      return allTerms.find((t) => t.num === num && t.year === year) || null;
    }
  );

/**
 * Ngrx Selector for the Aged Debtors Report.
 * It takes filters and returns the aggregated aged debtors data.
 */
export const getAgedDebtorsReport = (filters: AgedDebtorsReportFilters) =>
  createSelector(
    selectAllInvoices,
    getSelectedTermForAgedReport(filters),
    (
      allInvoices: InvoiceModel[] | null,
      selectedTerm: TermsModel | null
    ): AgedDebtorsReportData => {
      const asOfDate = filters.asOfDate || new Date();
      let filteredInvoices: InvoiceModel[] = [];

      let invoicesWithBalance = (allInvoices || []).filter(
        (inv) => inv.balance > 0
      );

      if (selectedTerm) {
        filteredInvoices = invoicesWithBalance.filter(
          (invoice) =>
            invoice.enrol?.num === selectedTerm.num &&
            invoice.enrol?.year === selectedTerm.year
        );
      } else {
        filteredInvoices = invoicesWithBalance;
      }

      if (filters.enrolmentName) {
        filteredInvoices = filteredInvoices.filter(
          (invoice) =>
            invoice.enrol?.name?.toLowerCase() ===
            filters.enrolmentName!.toLowerCase()
        );
      }

      if (filters.studentNumber) {
        filteredInvoices = filteredInvoices.filter(
          (invoice) => invoice.student?.studentNumber === filters.studentNumber
        );
      }

      let current = 0;
      let due1_30Days = 0;
      let due31_60Days = 0;
      let due61_90Days = 0;
      let due90PlusDays = 0;
      let totalOutstanding = 0;

      const detailedInvoices: AgedInvoiceSummary[] = [];

      filteredInvoices.forEach((invoice) => {
        if (!invoice.student || !invoice.enrol) {
          return;
        }

        // --- START CORRECTION FOR CURRENCYPIPE ERROR ---

        // Parse invoice.balance to a number.
        // It's crucial that the data source for 'invoice.balance' provides parseable strings or actual numbers.
        // If your InvoiceModel.balance property is typed as 'string', consider updating it to 'number'
        // and ensuring the data is converted to number earlier (e.g., in Ngrx effects when fetched).
        const parsedBalance = parseFloat(String(invoice.balance)); // Ensure it's treated as string before parseFloat

        if (isNaN(parsedBalance)) {
          return; // Skip this invoice if balance is not a valid number
        }

        // Also parse originalAmount for consistency if it's used with CurrencyPipe
        const parsedOriginalAmount = parseFloat(String(invoice.totalBill));
        if (isNaN(parsedOriginalAmount)) {
        }

        // --- END CORRECTION FOR CURRENCYPIPE ERROR ---

        const dueDate = invoice.invoiceDueDate
          ? new Date(invoice.invoiceDueDate)
          : new Date(invoice.invoiceDate);
        const daysOverdue = Math.floor(
          (asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let statusBucket:
          | 'Current'
          | '1-30 Days'
          | '31-60 Days'
          | '61-90 Days'
          | '90+ Days';

        if (daysOverdue < 0) {
          statusBucket = 'Current';
          current += parsedBalance; // Use parsed number
        } else if (daysOverdue >= 0 && daysOverdue <= 30) {
          statusBucket = '1-30 Days';
          due1_30Days += parsedBalance; // Use parsed number
        } else if (daysOverdue >= 31 && daysOverdue <= 60) {
          statusBucket = '31-60 Days';
          due31_60Days += parsedBalance; // Use parsed number
        } else if (daysOverdue >= 61 && daysOverdue <= 90) {
          statusBucket = '61-90 Days';
          due61_90Days += parsedBalance; // Use parsed number
        } else {
          statusBucket = '90+ Days';
          due90PlusDays += parsedBalance; // Use parsed number
        }

        totalOutstanding += parsedBalance; // Accumulate total outstanding using parsed number

        const studentFullName =
          `${invoice.student.name || ''} ${
            invoice.student.surname || ''
          }`.trim() || 'Unknown Student';
        const className = invoice.enrol.name || 'N/A';
        const termName = `Term ${invoice.enrol.num} (${invoice.enrol.year})`;

        detailedInvoices.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          studentName: studentFullName,
          studentNumber: invoice.student.studentNumber,
          className: className,
          termName: termName,
          invoiceDate: new Date(invoice.invoiceDate),
          dueDate: new Date(invoice.invoiceDueDate),
          originalAmount: parsedOriginalAmount, // Ensure this is also a number
          currentBalance: parsedBalance, // Ensure this is also a number
          daysOverdue: Math.max(0, daysOverdue),
          statusBucket: statusBucket,
        });
      });

      detailedInvoices.sort((a, b) => {
        const order = [
          'Current',
          '1-30 Days',
          '31-60 Days',
          '61-90 Days',
          '90+ Days',
        ];
        const statusOrderA = order.indexOf(a.statusBucket);
        const statusOrderB = order.indexOf(b.statusBucket);

        if (statusOrderA !== statusOrderB) {
          return statusOrderA - statusOrderB;
        }
        return a.studentName.localeCompare(b.studentName);
      });

      return {
        asOfDate: asOfDate,
        totalOutstanding: totalOutstanding,
        current: current,
        due1_30Days: due1_30Days,
        due31_60Days: due31_60Days,
        due61_90Days: due61_90Days,
        due90PlusDays: due90PlusDays,
        detailedInvoices: detailedInvoices,
      };
    }
  );

// --------------revenue recognition report --------------------------//
// --- Revenue Recognition Report Specific Selectors ---

// Helper selector to find a specific term for the report
const getSelectedTermForRevenueRecognition = (
  filters: RevenueRecognitionReportFilters
) =>
  createSelector(selectTerms, (allTerms: TermsModel[] | null) => {
    if (!filters.termId || !allTerms || allTerms.length === 0) {
      return null;
    }
    const [numStr, yearStr] = filters.termId.split('-');
    const num = parseInt(numStr, 10);
    const year = parseInt(yearStr, 10);
    return allTerms.find((t) => t.num === num && t.year === year) || null;
  });

/**
 * Selector for the Revenue Recognition Report.
 * Aggregates invoice data by term and optionally by class.
 */
export const getRevenueRecognitionReport = (
  filters: RevenueRecognitionReportFilters
) =>
  createSelector(
    selectAllInvoices,
    getSelectedTermForRevenueRecognition(filters),
    selectClasses,
    (
      allInvoices: InvoiceModel[] | null,
      selectedTerm: TermsModel | null,
      allClasses: ClassesModel[] | null
    ): RevenueRecognitionReportData => {
      // Initial checks for necessary data
      if (!allInvoices || !selectedTerm) {
        return { asOfDate: new Date(), reportData: [] };
      }

      // Filter invoices by the selected term
      const termInvoices = allInvoices.filter((invoice) => {
        return (
          invoice.enrol?.num === selectedTerm.num &&
          invoice.enrol?.year === selectedTerm.year
        );
      });

      const reportData: RevenueRecognitionSummary[] = [];

      // Determine which classes to process based on filter
      let classesToProcess: (ClassesModel | undefined)[] = []; // Can include 'undefined' for the "All Classes" summary

      if (filters.classId) {
        // If a specific class ID is selected, find that class
        const selectedClass = allClasses?.find((c) => c.id === filters.classId);
        if (selectedClass) {
          classesToProcess = [selectedClass];
        } else {
          // If a classId was provided but not found, return empty report
          return { asOfDate: new Date(), reportData: [] };
        }
      } else {
        // If no specific class is selected, group by all classes that have invoices for the term.
        // Collect unique class names from the term's invoices
        const uniqueClassNamesInTerm = new Set(
          termInvoices.map((inv) => inv.enrol?.name).filter(Boolean)
        );

        // Filter allClasses to include only those present in the invoices for the term
        const classesFromInvoices =
          allClasses?.filter((c) => uniqueClassNamesInTerm.has(c.name)) || [];

        if (classesFromInvoices.length > 0) {
          classesToProcess = classesFromInvoices;
        } else if (termInvoices.length > 0) {
          // If there are invoices for the term but no matching classes,
          // or if allClasses is empty/null, create a single summary for 'All Classes'
          classesToProcess = [undefined]; // 'undefined' represents the overall term summary (All Classes)
        } else {
          // No invoices and no matching classes for this term, return empty report
          return { asOfDate: new Date(), reportData: [] };
        }
      }

      if (classesToProcess.length > 0) {
        classesToProcess.forEach((currentClass) => {
          let classInvoices: InvoiceModel[];

          if (currentClass) {
            // Filter invoices by class name
            classInvoices = termInvoices.filter(
              (invoice) => invoice.enrol?.name === currentClass.name
            );
          } else {
            // This path is taken for the "All Classes" summary for the term
            classInvoices = termInvoices;
          }

          // Ensure values are numbers before summing
          const totalInvoiced = classInvoices.reduce(
            (sum, invoice) =>
              sum + (parseFloat(String(invoice.totalBill)) || 0),
            0
          );
          const totalOutstanding = classInvoices.reduce(
            (sum, invoice) => sum + (parseFloat(String(invoice.balance)) || 0),
            0
          );
          const studentCount = new Set(
            classInvoices.map((invoice) => invoice.student?.studentNumber)
          ).size; // Unique student count

          // Only add to report if there's actual data for this class or if it's the general term summary
          if (classInvoices.length > 0) {
            // Condition to avoid empty rows
            reportData.push({
              termName: `Term ${selectedTerm.num} (${selectedTerm.year})`,
              className: currentClass?.name, // Will be undefined if it's the 'All Classes' summary
              totalInvoiced: totalInvoiced,
              totalOutstanding: totalOutstanding,
              studentCount: studentCount,
            });
          }
        });
      }

      // If after all filtering, reportData is empty but termInvoices exist
      // This can happen if classesToProcess ends up empty (e.g. no classes for uniqueClassNamesInTerm),
      // but there are still invoices for the term. Add an 'All Classes' summary.
      if (reportData.length === 0 && termInvoices.length > 0) {
        const totalInvoiced = termInvoices.reduce(
          (sum, invoice) => sum + (parseFloat(String(invoice.totalBill)) || 0),
          0
        );
        const totalOutstanding = termInvoices.reduce(
          (sum, invoice) => sum + (parseFloat(String(invoice.balance)) || 0),
          0
        );
        const studentCount = new Set(
          termInvoices.map((invoice) => invoice.student?.studentNumber)
        ).size; // Unique student count

        reportData.push({
          termName: `Term ${selectedTerm.num} (${selectedTerm.year})`,
          className: undefined, // Indicates 'All Classes' for this term
          totalInvoiced: totalInvoiced,
          totalOutstanding: totalOutstanding,
          studentCount: studentCount,
        });
      }

      // Sort report data if needed (e.g., by class name)
      reportData.sort((a, b) =>
        (a.className || 'ZZZ').localeCompare(b.className || 'ZZZ')
      ); // 'ZZZ' to push undefined to end

      return {
        asOfDate: new Date(),
        reportData: reportData,
      };
    }
  );

// --------------- Enrollment vs Billing Reconcilliation Report Selector ---------- //
/**
 * Helper selector to find a specific term for the enrollment vs billing report.
 * Reusing previous helper, but explicitly defined for this report's context.
 */
const getSelectedTermForEnrollmentBilling = (
  filters: EnrollmentBillingReportFilters
) =>
  createSelector(selectTerms, (allTerms: TermsModel[] | null) => {
    if (!filters.termId || !allTerms || allTerms.length === 0) {
      return null;
    }
    const [numStr, yearStr] = filters.termId.split('-');
    const num = parseInt(numStr, 10);
    const year = parseInt(yearStr, 10);
    return allTerms.find((t) => t.num === num && t.year === year) || null;
  });

/**
 * Selector for the Enrollment vs. Billing Reconciliation Report.
 * Compares enrolled students with generated invoices for a given term/class.
 */
export const getEnrollmentBillingReconciliationReport = (
  filters: EnrollmentBillingReportFilters
) =>
  createSelector(
    selectTermEnrols,
    selectAllInvoices, // From finance.selector.ts
    selectStudents, // From students.selectors.ts
    getSelectedTermForEnrollmentBilling(filters),
    selectClasses, // From enrolment.selectors.ts
    (
      allEnrols: EnrolsModel[] | null,
      allInvoices: InvoiceModel[] | null,
      allStudents: StudentsModel[] | null,
      selectedTerm: TermsModel | null,
      allClasses: ClassesModel[] | null
    ): EnrollmentBillingReportData => {
      if (
        !allEnrols ||
        !allInvoices ||
        !allStudents ||
        !selectedTerm ||
        !allClasses
      ) {
        return {
          asOfDate: new Date(),
          summary: {
            termName: '',
            totalStudentsEnrolled: 0,
            totalStudentsInvoiced: 0,
            totalDiscrepancies: 0,
          },
          details: [],
        };
      }

      const reportDetails: EnrollmentBillingReportDetail[] = [];
      let totalStudentsEnrolled = 0;
      let totalStudentsInvoiced = 0;
      let totalDiscrepancies = 0;

      // 1. Filter enrollments for the selected term and optionally class
      let filteredEnrolments = allEnrols.filter(
        (enrol) =>
          enrol.num === selectedTerm.num && enrol.year === selectedTerm.year
      );

      if (filters.classId) {
        // If a specific class is chosen, further filter enrolments by class name
        const selectedClass = allClasses.find((c) => c.id === filters.classId);
        if (selectedClass) {
          filteredEnrolments = filteredEnrolments.filter(
            (enrol) => enrol.name === selectedClass.name
          );
        } else {
          // Class filter applied but class not found, return empty report
          return {
            asOfDate: new Date(),
            summary: {
              termName: `Term ${selectedTerm.num} (${selectedTerm.year})`,
              className: filters.classId,
              totalStudentsEnrolled: 0,
              totalStudentsInvoiced: 0,
              totalDiscrepancies: 0,
            },
            details: [],
          };
        }
      }

      // Track students who have been invoiced in this specific context
      const invoicedStudentKeys = new Set<string>(); // Use studentNumber + class name for uniqueness within term/class context

      // 2. Iterate through filtered enrollments
      for (const enrol of filteredEnrolments) {
        totalStudentsEnrolled++;
        const student = allStudents.find(
          (s) => s.studentNumber === enrol.student?.studentNumber
        );

        if (!student) {
          continue; // Skip if student data is missing
        }

        // Find relevant invoices for this student and enrollment
        const relevantInvoice = allInvoices.find(
          (invoice) =>
            invoice.student?.studentNumber === student.studentNumber &&
            invoice.enrol?.num === enrol.num &&
            invoice.enrol?.year === enrol.year &&
            invoice.enrol?.name === enrol.name // Match by class name from enrolment
        );

        const isDiscrepancy = !relevantInvoice;
        if (!relevantInvoice) {
          totalDiscrepancies++;
        } else {
          // If invoiced, add to the count and mark as invoiced
          // Ensure we count unique invoiced students for the summary
          const key = `${student.studentNumber}-${enrol.name}`;
          if (!invoicedStudentKeys.has(key)) {
            totalStudentsInvoiced++;
            invoicedStudentKeys.add(key);
          }
        }

        reportDetails.push({
          studentNumber: student.studentNumber,
          studentName: `${student.name} ${student.surname}`,
          className: enrol.name, // Class name from enrolment
          enrolledStatus: 'Enrolled',
          invoicedStatus: relevantInvoice ? 'Invoiced' : 'Not Invoiced',
          invoiceNumber: relevantInvoice?.invoiceNumber,
          balance: relevantInvoice?.balance,
          discrepancy: isDiscrepancy,
          discrepancyMessage: isDiscrepancy
            ? 'Enrolled but Not Invoiced'
            : undefined,
        });
      }

      // Sort details by class name then student name
      reportDetails.sort((a, b) => {
        const classCompare = (a.className || '').localeCompare(
          b.className || ''
        );
        if (classCompare !== 0) return classCompare;
        return (a.studentName || '').localeCompare(b.studentName || '');
      });

      const summary: EnrollmentBillingReportSummary = {
        termName: `Term ${selectedTerm.num} (${selectedTerm.year})`,
        className: filters.classId
          ? allClasses.find((c) => c.id === filters.classId)?.name ||
            'Unknown Class'
          : 'All Classes',
        totalStudentsEnrolled: totalStudentsEnrolled,
        totalStudentsInvoiced: totalStudentsInvoiced,
        totalDiscrepancies: totalDiscrepancies,
      };

      return {
        asOfDate: new Date(),
        summary: summary,
        details: reportDetails,
      };
    }
  );
