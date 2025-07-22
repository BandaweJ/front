import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { PaymentMethods } from '../../enums/payment-methods.enum';
import { Store } from '@ngrx/store';
import {
  // Good: You're now explicitly using selectAmountDue
  selectAmountDue,
  selectCreatedReceipt,
  // Good: You're using selectNewReceipt, aligning with your reducer's `createdReceipt`
  // ADD these back if you want to show loading/error states in the UI
  selectIsLoadingFinancials,
  // selectFinancialsError,
  // selectIsSavingReceipt,
  // selectSaveReceiptError,
} from '../../store/finance.selector';
import { receiptActions } from '../../store/finance.actions';
import { filter, Observable, Subject, takeUntil } from 'rxjs'; // Removed `combineLatest` as it's not explicitly used here
import { State } from '../../store/finance.reducer';
import { MatDialogRef } from '@angular/material/dialog';
import { ReceiptModel } from '../../models/payment.model';

@Component({
  selector: 'app-add-receipt-dialog',
  templateUrl: './add-receipt-dialog.component.html',
  styleUrls: ['./add-receipt-dialog.component.css'],
})
export class AddReceiptDialogComponent implements OnInit, OnDestroy {
  addReceiptForm: FormGroup;
  student!: StudentsModel; // This will now be set by getSelectedStudent
  paymentMethods = [...Object.values(PaymentMethods)];

  // Observables for state from NgRx Store
  amountDue$: Observable<number | null>;

  // Re-add these if you plan to use them in your template for loading/error indicators
  isLoadingFinancials$: Observable<boolean>;
  // financialsError$: Observable<string | null>;
  // isSavingReceipt$: Observable<boolean>;
  // saveReceiptError$: Observable<string | null>;
  createdReceipt$!: Observable<ReceiptModel>;

  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<AddReceiptDialogComponent>,
    private fb: FormBuilder,
    private store: Store<State>
  ) {
    this.addReceiptForm = this.fb.group({
      amountPaid: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['', Validators.required],
      description: [''],
    });

    this.amountDue$ = this.store.select(selectAmountDue);
    this.store.select(selectAmountDue).subscribe((val) => console.log(val));

    // Initialize loading and error observables if you re-add them
    this.isLoadingFinancials$ = this.store.select(selectIsLoadingFinancials);
    // this.financialsError$ = this.store.select(selectFinancialsError);
    // this.isSavingReceipt$ = this.store.select(selectIsSavingReceipt);
    // this.saveReceiptError$ = this.store.select(selectSaveReceiptError);
    this.createdReceipt$ = this.store.select(selectCreatedReceipt);
  }

  ngOnInit(): void {
    // Moved the subscription for closing the dialog to ngOnInit
    this.createdReceipt$
      .pipe(
        filter((receipt) => !!receipt && !!receipt.receiptNumber), // Ensure receipt is not null and has a receiptNumber
        takeUntil(this.destroy$)
      )
      .subscribe((receipt) => {
        this.dialogRef.close(receipt);
      });

    // You might want to consider dispatching fetchStudentOutstandingBalance
    // here if the dialog *always* opens with a student (even if you don't use MAT_DIALOG_DATA for it).
    // If the student search is truly internal and the balance is fetched *after* selection,
    // then it's fine to leave it in getSelectedStudent.
  }

  ngOnDestroy(): void {
    this.store.dispatch(receiptActions.clearStudentFinancials());
    this.store.dispatch(receiptActions.clearCreatedReceipt());
    this.destroy$.next();
    this.destroy$.complete();
  }

  get amountPaidControl() {
    return this.addReceiptForm.get('amountPaid');
  }

  get paymentMethodControl() {
    return this.addReceiptForm.get('paymentMethod');
  }

  get description() {
    return this.addReceiptForm.get('description');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.addReceiptForm.valid && this.student?.studentNumber) {
      const { amountPaid, paymentMethod, description } =
        this.addReceiptForm.value;

      this.store.dispatch(
        receiptActions.saveReceipt({
          studentNumber: this.student.studentNumber,
          amountPaid: +amountPaid,
          paymentMethod: paymentMethod,
          description: description,
        })
      );
    } else {
      this.addReceiptForm.markAllAsTouched();
    }
  }

  getSelectedStudent(student: StudentsModel) {
    this.student = student;
    if (this.student.studentNumber) {
      // Dispatch action to fetch student's outstanding balance
      this.store.dispatch(
        receiptActions.fetchStudentOutstandingBalance({
          studentNumber: this.student.studentNumber,
        })
      );
    }
  }
}
