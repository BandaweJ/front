import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaymentMethods } from '../../enums/payment-methods.enum';
import { map, Observable, of, startWith } from 'rxjs';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { select, Store } from '@ngrx/store';
import { selectStudents } from 'src/app/registration/store/registration.selectors';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReceiptFilter } from '../../models/receipt-filter.model';

@Component({
  selector: 'app-filter-receipts-dialog',
  templateUrl: './filter-receipts-dialog.component.html',
  styleUrls: ['./filter-receipts-dialog.component.css'],
})
export class FilterReceiptsDialogComponent {
  filterForm!: FormGroup;
  paymentMethods = Object.values(PaymentMethods); // Get all values from your enum

  // For student autocomplete
  allStudents$: Observable<StudentsModel[]> = this.store.pipe(
    select(selectStudents)
  );
  filteredStudents$: Observable<StudentsModel[]> = of([]);
  selectedStudent: StudentsModel | null = null; // Store the selected student object

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FilterReceiptsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentFilters: ReceiptFilter },
    private store: Store // Inject NgRx Store
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      startDate: [this.data.currentFilters?.startDate || null],
      endDate: [this.data.currentFilters?.endDate || null],
      studentSearch: [
        this.data.currentFilters?.studentNumber
          ? this.getStudentNameFromId(this.data.currentFilters.studentNumber)
          : '',
      ], // Use studentSearch for autocomplete input
      minAmount: [this.data.currentFilters?.minAmount || null],
      maxAmount: [this.data.currentFilters?.maxAmount || null],
      paymentMethods: [this.data.currentFilters?.paymentMethods || []],
      approved: [this.data.currentFilters?.approved || null], // Use null for 'any' state
      servedBy: [this.data.currentFilters?.servedBy || null],
    });

    // Initialize selectedStudent if a studentNumber is provided in initial filters
    if (this.data.currentFilters?.studentNumber) {
      this.allStudents$.subscribe((students) => {
        this.selectedStudent =
          students.find(
            (s) => s.studentNumber === this.data.currentFilters?.studentNumber
          ) || null;
      });
    }

    // Set up student autocomplete filtering
    this.filteredStudents$ = this.filterForm
      .get('studentSearch')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => (typeof value === 'string' ? value : value?.name || '')),
        map((name) =>
          name ? this._filterStudents(name) : this.initialStudentsArray || []
        )
      );

    // Fetch initial student array for filtering
    this.allStudents$.subscribe((students) => {
      this.initialStudentsArray = students; // Store for synchronous filtering
      // If a student was already selected, make sure their display name is in the input
      const studentNumber = this.data.currentFilters?.studentNumber;
      if (studentNumber) {
        const preselectedStudent = students.find(
          (s) => s.studentNumber === studentNumber
        );
        if (preselectedStudent) {
          this.filterForm
            .get('studentSearch')
            ?.setValue(
              preselectedStudent.name + ' ' + preselectedStudent.surname
            );
          this.selectedStudent = preselectedStudent;
        }
      }
    });
  }

  // Helper to get student name for initial filter form display
  // In a real app, you'd likely fetch student by ID or pass student name in initialFilters
  private getStudentNameFromId(studentNumber: string): string {
    // This is a simplified lookup. In a real app, you might need to query the store or backend.
    // For now, it will just be an empty string, until allStudents$ loads and sets it.
    return '';
  }

  // Private array to hold all students for filtering (sync)
  private initialStudentsArray: StudentsModel[] = [];

  private _filterStudents(value: string): StudentsModel[] {
    const filterValue = value.toLowerCase();
    return this.initialStudentsArray.filter(
      (student) =>
        student.name.toLowerCase().includes(filterValue) ||
        student.surname.toLowerCase().includes(filterValue) ||
        student.studentNumber.toLowerCase().includes(filterValue)
    );
  }

  displayStudentFn(student: StudentsModel | string): string {
    return typeof student === 'object'
      ? `${student.name} ${student.surname} (${student.studentNumber})`
      : student || '';
  }

  onStudentSelected(event: any): void {
    this.selectedStudent = event.option.value;
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;
    const filters: ReceiptFilter = {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      studentNumber: this.selectedStudent
        ? this.selectedStudent.studentNumber
        : null,
      minAmount: formValue.minAmount,
      maxAmount: formValue.maxAmount,
      paymentMethods: formValue.paymentMethods,
      approved: formValue.approved,
      servedBy: formValue.servedBy,
    };
    this.dialogRef.close(filters); // Pass the filters back
  }

  clearFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      studentSearch: '',
      minAmount: null,
      maxAmount: null,
      paymentMethods: [],
      approved: null,
      servedBy: null,
    });
    this.selectedStudent = null; // Clear selected student object
    this.dialogRef.close({}); // Close with an empty filter object
  }

  cancel(): void {
    this.dialogRef.close(); // Close without passing any data
  }
}
