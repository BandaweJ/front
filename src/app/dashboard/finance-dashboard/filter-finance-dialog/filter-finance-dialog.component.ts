import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FinanceFilter } from '../../models/finance-filter.model'; // Ensure path is correct
import { PaymentMethods } from '../../../finance/models/payment-methods.enum'; // Import your PaymentMethods enum

@Component({
  selector: 'app-filter-finance-dialog',
  templateUrl: './filter-finance-dialog.component.html',
  styleUrls: ['./filter-finance-dialog.component.css'],
})
export class FilterFinanceDialogComponent implements OnInit {
  filterForm: FormGroup;

  // Updated static options based on your FinanceDataModel's 'type' and 'status'
  // and your PaymentMethods enum
  transactionTypes: ('Invoice' | 'Payment')[] = ['Invoice', 'Payment']; // Explicitly only Invoice and Payment
  paymentMethods = Object.values(PaymentMethods); // Get all values from your enum

  // Unified Statuses from FinanceDataModel's status field
  unifiedStatuses: string[] = [
    'Paid',
    'Partially Paid',
    'Outstanding',
    'Overdue',
    'Approved',
    'Pending',
    'Cancelled', // If applicable for invoices
  ];

  // Finance categories will now likely derive from your FeesModel names or bill descriptions
  // For now, keep it static, but consider making this dynamic if your fees change often
  financeCategories: string[] = [
    'Tuition Fees',
    'Uniform Sales',
    // Add other relevant fee/bill categories that you track
  ];

  // Example options for academic year, term, grade level (might be dynamic)
  academicYears: string[] = [
    '2023/2024',
    '2024/2025',
    '2025/2026',
    '2026/2027',
  ]; // Example years
  terms: string[] = ['Term 1', 'Term 2', 'Term 3']; // Example terms
  gradeLevels: string[] = [
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Form 1',
    'Form 2',
    'Form 3',
    'Form 4',
    'Lower 6',
    'Upper 6',
  ]; // Example grades

  // Example: You might have a list of all current staff for 'servedBy'
  // servedByStaff: StaffModel[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FilterFinanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentFilters: FinanceFilter }
  ) {
    // Initialize the form with current filter values or defaults
    this.filterForm = this.fb.group({
      startDate: [
        data.currentFilters.startDate
          ? new Date(data.currentFilters.startDate)
          : null,
      ],
      endDate: [
        data.currentFilters.endDate
          ? new Date(data.currentFilters.endDate)
          : null,
      ],
      transactionType: [data.currentFilters.transactionType || null],
      studentId: [data.currentFilters.studentId || null],
      studentName: [data.currentFilters.studentName || null], // New
      invoiceNumber: [data.currentFilters.invoiceNumber || null], // New
      receiptNumber: [data.currentFilters.receiptNumber || null], // New
      paymentMethod: [data.currentFilters.paymentMethod || null], // New
      status: [data.currentFilters.status || null],
      enrolAcademicYear: [data.currentFilters.enrolAcademicYear || null], // New
      enrolTerm: [data.currentFilters.enrolTerm || null], // New
      enrolGradeLevel: [data.currentFilters.enrolGradeLevel || null], // New
      minAmount: [data.currentFilters.minAmount || null],
      maxAmount: [data.currentFilters.maxAmount || null],
      servedBy: [data.currentFilters.servedBy || null], // New
      // Removed: category (if you're not using it directly as a filter)
      // Removed: accountId
    });
  }

  ngOnInit(): void {
    // Optionally fetch dynamic data here, e.g., students for studentName search, staff for servedBy
    // this.financeService.getStudentsForFilter().subscribe(students => this.students = students);
    // this.staffService.getStaffForFilter().subscribe(staff => this.servedByStaff = staff);
  }

  onApplyFilters(): void {
    const formValue = this.filterForm.value;

    // Construct the FinanceFilter object, ensuring dates are ISO strings if needed
    const filters: FinanceFilter = {
      startDate: formValue.startDate
        ? formValue.startDate.toISOString().split('T')[0]
        : undefined,
      endDate: formValue.endDate
        ? formValue.endDate.toISOString().split('T')[0]
        : undefined,
      transactionType: formValue.transactionType || undefined,
      studentId: formValue.studentId || undefined,
      studentName: formValue.studentName || undefined,
      invoiceNumber: formValue.invoiceNumber || undefined,
      receiptNumber: formValue.receiptNumber || undefined,
      paymentMethod: formValue.paymentMethod || undefined,
      status: formValue.status || undefined,
      enrolAcademicYear: formValue.enrolAcademicYear || undefined,
      enrolTerm: formValue.enrolTerm || undefined,
      enrolGradeLevel: formValue.enrolGradeLevel || undefined,
      minAmount: formValue.minAmount || undefined,
      maxAmount: formValue.maxAmount || undefined,
      servedBy: formValue.servedBy || undefined,
    };
    this.dialogRef.close(filters);
  }

  onClearFilters(): void {
    this.filterForm.reset();
    this.dialogRef.close({}); // Pass an empty object to clear all filters
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
