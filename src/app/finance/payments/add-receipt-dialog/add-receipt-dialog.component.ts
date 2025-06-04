// src/app/payments/add-receipt-dialog/add-receipt-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // For a reactive form
import { StudentsModel } from 'src/app/registration/models/students.model';
import { ReceiptModel } from '../../models/payment.model';
import { PaymentMethods } from '../../models/payment-methods.enum';
import { Store } from '@ngrx/store';
import { selectNewReceipt } from '../../store/finance.selector';
import { receiptActions } from '../../store/finance.actions';

@Component({
  selector: 'app-add-receipt-dialog',
  templateUrl: './add-receipt-dialog.component.html',
  styleUrls: ['./add-receipt-dialog.component.css'],
})
export class AddReceiptDialogComponent {
  addReceiptForm: FormGroup;
  student!: StudentsModel;
  receipt!: ReceiptModel;
  paymentMethods = [...Object.values(PaymentMethods)];
  receipt$ = this.store.select(selectNewReceipt);

  constructor(
    public dialogRef: MatDialogRef<AddReceiptDialogComponent>,
    private fb: FormBuilder,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: any // Use this if you pass data into the dialog
  ) {
    this.addReceiptForm = this.fb.group({
      amountPaid: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['', Validators.required],
      description: [''],
      // Add other form controls for your receipt fields
    });
    this.receipt$.subscribe((receipt) => {
      this.receipt = receipt;
    });
  }

  get amountPaid() {
    return this.addReceiptForm.get('amountPaid');
  }

  onNoClick(): void {
    this.dialogRef.close(); // Close dialog without returning data
  }

  onSubmit(): void {
    if (this.addReceiptForm.valid) {
      const receipt: ReceiptModel = {
        ...this.receipt,
        amountPaid: +this.addReceiptForm.value.amountPaid,
        paymentMethod: this.addReceiptForm.value.paymentMethod,
        description: this.addReceiptForm.value.description,
        amountOutstanding:
          +this.receipt.amountDue - +this.addReceiptForm.value.amountPaid,

        // Add other form values for your receipt
      };
      this.dialogRef.close(receipt);

      // console.log('Form submitted:', this.addReceiptForm.value);
      // When the form is submitted, close the dialog and pass the form value back
    } else {
      this.addReceiptForm.markAllAsTouched(); // Show validation errors
    }
  }

  getSelectedStudent(student: StudentsModel) {
    this.student = student;
    if (this.student) {
      this.store.dispatch(
        receiptActions.fetchNewReceipt({
          studentNumber: this.student.studentNumber,
        })
      );
    }
  }
}
