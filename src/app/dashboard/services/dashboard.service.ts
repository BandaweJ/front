import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FinanceDataModel } from '../models/finance-data.model';
import { PaymentMethods } from 'src/app/finance/models/payment-methods.enum';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private httpClient: HttpClient) {}
  baseURL = `${environment.apiUrl}dashboard/`;

  getStudentDashboardSummary(
    studentNumber: string
  ): Observable<StudentDashboardSummary> {
    return this.httpClient.get<StudentDashboardSummary>(
      `${this.baseURL}student/${studentNumber}`
    );
  }
  getAllFinanceData(): Observable<FinanceDataModel[]> {
    // return this.httpClient.get<FinanceDataModel[]>(this.baseURL);
    return of(this.MOCK_FINANCE_DATA);
  }

  MOCK_FINANCE_DATA: FinanceDataModel[] = [
    // --- Invoices ---
    {
      id: 'INV-001',
      transactionDate: '2025-01-15',
      amount: 1500.0, // Current outstanding balance for dashboard
      type: 'Invoice',
      description: 'Term 1 Tuition Fees - Grade 7',
      date: new Date('2025-01-15T10:00:00Z'),
      studentId: 'S001',
      studentName: 'Alice Johnson',
      invoiceNumber: 'INV-001',
      invoiceDate: '2025-01-15',
      invoiceDueDate: '2025-02-15',
      invoiceTotalBill: 2000.0,
      invoiceBalance: 1500.0,
      enrolId: 'ENR-001',
      enrolAcademicYear: '2025/2026',
      enrolTerm: 'Term 1, 2025',
      enrolClass: '7 Alpha',
      status: 'Partially Paid',
    },
    {
      id: 'INV-002',
      transactionDate: '2025-02-01',
      amount: 0.0, // Balance is 0
      type: 'Invoice',
      description: 'Bus Service Fees - February',
      date: new Date('2025-02-01T11:30:00Z'),
      studentId: 'S002',
      studentName: 'Bob Williams',
      invoiceNumber: 'INV-002',
      invoiceDate: '2025-02-01',
      invoiceDueDate: '2025-02-28',
      invoiceTotalBill: 300.0,
      invoiceBalance: 0.0,
      enrolId: 'ENR-002',
      enrolAcademicYear: '2025/2026',
      enrolTerm: 'Term 1, 2025',
      enrolClass: '5 Beta',
      status: 'Paid',
    },
    {
      id: 'INV-003',
      transactionDate: '2025-03-10',
      amount: 750.0,
      type: 'Invoice',
      description: 'Term 2 Tuition Fees - Grade 4',
      date: new Date('2025-03-10T09:15:00Z'),
      studentId: 'S003',
      studentName: 'Charlie Brown',
      invoiceNumber: 'INV-003',
      invoiceDate: '2025-03-10',
      invoiceDueDate: '2025-04-10',
      invoiceTotalBill: 750.0,
      invoiceBalance: 750.0,
      enrolId: 'ENR-003',
      enrolAcademicYear: '2025/2026',
      enrolTerm: 'Term 2, 2025',
      enrolClass: '4 Gamma',
      status: 'Outstanding',
    },
    {
      id: 'INV-004',
      transactionDate: '2025-04-05',
      amount: 100.0,
      type: 'Invoice',
      description: 'Sports Club Subscription - Q2',
      date: new Date('2025-04-05T14:00:00Z'),
      studentId: 'S001',
      studentName: 'Alice Johnson',
      invoiceNumber: 'INV-004',
      invoiceDate: '2025-04-05',
      invoiceDueDate: '2025-04-30',
      invoiceTotalBill: 100.0,
      invoiceBalance: 100.0,
      enrolId: 'ENR-001',
      enrolAcademicYear: '2025/2026',
      enrolTerm: 'Term 2, 2025',
      enrolClass: '7 Alpha',
      status: 'Overdue', // Assuming it's past due date
    },
    {
      id: 'INV-005',
      transactionDate: '2025-05-20',
      amount: 0.0,
      type: 'Invoice',
      description: 'Library Fines - Q1/Q2',
      date: new Date('2025-05-20T16:00:00Z'),
      studentId: 'S004',
      studentName: 'Diana Prince',
      invoiceNumber: 'INV-005',
      invoiceDate: '2025-05-20',
      invoiceDueDate: '2025-06-20',
      invoiceTotalBill: 50.0,
      invoiceBalance: 0.0,
      enrolId: 'ENR-004',
      enrolAcademicYear: '2025/2026',
      enrolTerm: 'Term 2, 2025',
      enrolClass: '1 Delta',
      status: 'Paid',
    },
    {
      id: 'INV-006',
      transactionDate: '2025-06-01',
      amount: 1000.0,
      type: 'Invoice',
      description: 'New Student Enrollment Fee',
      date: new Date('2025-06-01T08:30:00Z'),
      studentId: 'S005',
      studentName: 'Eve Adams',
      invoiceNumber: 'INV-006',
      invoiceDate: '2025-06-01',
      invoiceDueDate: '2025-07-01',
      invoiceTotalBill: 1000.0,
      invoiceBalance: 1000.0,
      enrolId: 'ENR-005',
      enrolAcademicYear: '2025/2026',
      enrolTerm: 'Term 3, 2025',
      enrolClass: 'Kinder Green',
      status: 'Outstanding',
    },

    // --- Payments ---
    {
      id: 'RCPT-001',
      transactionDate: '2025-01-20',
      amount: 500.0, // Amount of this specific payment
      type: 'Payment',
      description: 'Payment for INV-001',
      date: new Date('2025-01-20T12:00:00Z'),
      studentId: 'S001',
      studentName: 'Alice Johnson',
      receiptNumber: 'RCPT-001',
      paymentMethod: PaymentMethods.bankTransfer,
      receiptAmountPaid: 500.0,
      receiptAmountDueBeforePayment: 2000.0, // Corresponds to INV-001 total
      receiptAmountOutstandingAfterPayment: 1500.0, // 2000 - 500
      receiptApproved: true,
      receiptServedBy: 'John Doe',
      status: 'Approved', // Status of the receipt itself
    },
    {
      id: 'RCPT-002',
      transactionDate: '2025-02-10',
      amount: 300.0,
      type: 'Payment',
      description: 'Payment for INV-002 (Full)',
      date: new Date('2025-02-10T09:00:00Z'),
      studentId: 'S002',
      studentName: 'Bob Williams',
      receiptNumber: 'RCPT-002',
      paymentMethod: PaymentMethods.ecocash,
      receiptAmountPaid: 300.0,
      receiptAmountDueBeforePayment: 300.0,
      receiptAmountOutstandingAfterPayment: 0.0,
      receiptApproved: true,
      receiptServedBy: 'Jane Smith',
      status: 'Approved',
    },
    {
      id: 'RCPT-003',
      transactionDate: '2025-05-25',
      amount: 50.0,
      type: 'Payment',
      description: 'Payment for INV-005 (Full)',
      date: new Date('2025-05-25T10:00:00Z'),
      studentId: 'S004',
      studentName: 'Diana Prince',
      receiptNumber: 'RCPT-003',
      paymentMethod: PaymentMethods.cash,
      receiptAmountPaid: 50.0,
      receiptAmountDueBeforePayment: 50.0,
      receiptAmountOutstandingAfterPayment: 0.0,
      receiptApproved: true,
      receiptServedBy: 'John Doe',
      status: 'Approved',
    },
    {
      id: 'RCPT-004',
      transactionDate: '2025-06-05', // Today's date
      amount: 500.0,
      type: 'Payment',
      description: 'Initial payment for INV-006',
      date: new Date('2025-06-05T14:10:00Z'),
      studentId: 'S005',
      studentName: 'Eve Adams',
      receiptNumber: 'RCPT-004',
      paymentMethod: PaymentMethods.cash,
      receiptAmountPaid: 500.0,
      receiptAmountDueBeforePayment: 1000.0,
      receiptAmountOutstandingAfterPayment: 500.0,
      receiptApproved: true,
      receiptServedBy: 'Online System',
      status: 'Approved',
    },
    {
      id: 'RCPT-005',
      transactionDate: '2025-06-04',
      amount: 100.0,
      type: 'Payment',
      description: 'Refund for overpayment on fees',
      date: new Date('2025-06-04T09:00:00Z'),
      studentId: 'S006',
      studentName: 'Frank Green',
      receiptNumber: 'RCPT-005',
      paymentMethod: PaymentMethods.bankTransfer,
      receiptAmountPaid: -100.0, // Representing a refund
      receiptApproved: true,
      receiptServedBy: 'Jane Smith',
      status: 'Approved',
    },
    {
      id: 'RCPT-006',
      transactionDate: '2025-06-05',
      amount: 200.0,
      type: 'Payment',
      description: 'Pending payment for INV-003',
      date: new Date('2025-06-05T11:00:00Z'),
      studentId: 'S003',
      studentName: 'Charlie Brown',
      receiptNumber: 'RCPT-006',
      paymentMethod: PaymentMethods.ecocash,
      receiptAmountPaid: 200.0,
      receiptAmountDueBeforePayment: 750.0,
      receiptAmountOutstandingAfterPayment: 550.0,
      receiptApproved: false, // E.g., cheque not cleared yet
      receiptServedBy: 'Mary White',
      status: 'Pending',
    },
  ];
}
