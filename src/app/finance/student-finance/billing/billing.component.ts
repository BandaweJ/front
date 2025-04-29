import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  billStudentActions,
  feesActions,
  isNewComerActions,
} from '../../store/finance.actions';
import { FeesModel } from '../../models/fees.model';
import {
  selectedStudentInvoice,
  selectFees,
  selectIsNewComer,
} from '../../store/finance.selector';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { BillModel } from '../../models/bill.model';
import { SharedService } from 'src/app/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from 'src/app/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class BillingComponent implements OnInit, OnChanges {
  fees$ = this.store.select(selectFees);
  isNewComer$ = this.store.select(selectIsNewComer);
  isScienceStudent: boolean = false;
  @Input() enrolment: EnrolsModel | null = null;
  // selectedFees: FeesModel[] = [];
  selectedBills: BillModel[] = [];
  toBill: BillModel[] = [];

  constructor(
    private store: Store,
    public sharedService: SharedService,
    public dialog: MatDialog
  ) {
    this.store.dispatch(feesActions.fetchFees());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enrolment'] && changes['enrolment'].currentValue) {
      // console.log('enrolment in billing (ngOnChanges): ', this.enrolment);
      if (this.enrolment?.name?.toLowerCase().includes('science')) {
        this.isScienceStudent = true;
        // console.log('science', this.isScienceStudent);
      }
      if (this.enrolment?.student?.studentNumber) {
        const studentNumber = this.enrolment.student.studentNumber;
        this.store.dispatch(
          isNewComerActions.checkIsNewComer({ studentNumber })
        );
      }
      // You can move any logic that depends on 'enrolment' here
    }
  }

  ngOnInit(): void {
    this.store.select(selectedStudentInvoice).subscribe((invoice) => {
      this.selectedBills = [...invoice.bills];
    });
  }

  addToBill(fee: FeesModel) {
    if (this.enrolment?.student) {
      const index = this.selectedBills.findIndex(
        (selectedBill) => selectedBill.fees.id === fee.id
      );
      if (index === -1) {
        const bill: BillModel = {
          student: this.enrolment?.student,
          fees: fee,
          enrol: this.enrolment,
        };

        this.selectedBills.push(bill);
        this.toBill.push(bill);
      } else {
        // Remove the fee if it's already selected
        this.confirmBillRemoval(fee);
        // this.selectedBills = this.selectedBills.filter(
        //   (selectedBill) => selectedBill.fees.id !== fee.id
        // );
      }
    }
  }

  isSelected(fee: FeesModel): boolean {
    return this.selectedBills.some(
      (selectedBill) => selectedBill.fees.id === fee.id
    );
  }

  // removeFromBill(fee: FeesModel) {
  //   this.selectedBills = this.selectedBills.filter((f) => f.id !== fee.id);
  // }

  billStudent() {
    this.store.dispatch(billStudentActions.billStudent({ bills: this.toBill }));
    this.toBill = [];
  }

  removeBill(fee: FeesModel) {
    const bill = this.selectedBills.find(
      (selectedBill) => selectedBill.fees.id === fee.id
    );
    if (bill) {
      this.store.dispatch(billStudentActions.removeBill({ bill }));
    }
  }

  confirmBill() {
    this.openBillConfirmationDialog(
      'Are you sure you want to bill student with selected fees?'
    );
  }

  confirmBillRemoval(fee: FeesModel) {
    this.openBillRemovalConfirmationDialog(
      'Are you sure you want to remove this fee from this student?',
      fee
    );
  }

  openBillRemovalConfirmationDialog(message: string, fee: FeesModel): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px', // Adjust width as needed
      data: { message: message, title: 'Confirm Bill Removal' }, // Use the provided message
    });

    dialogRef.afterClosed().subscribe((result) => {
      // this.submissionAttempted = true;
      if (result) {
        // this.submissionConfirmed = true;
        this.removeBill(fee); // Call your form submission logic here
      } else {
        // this.submissionConfirmed = false;
        // User clicked 'No' or closed the dialog
        dialogRef.close();
      }
    });
  }

  openBillConfirmationDialog(message: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px', // Adjust width as needed
      data: { message: message, title: 'Confirm Billing' }, // Use the provided message
    });

    dialogRef.afterClosed().subscribe((result) => {
      // this.submissionAttempted = true;
      if (result) {
        // this.submissionConfirmed = true;
        this.billStudent(); // Call your form submission logic here
      } else {
        // this.submissionConfirmed = false;
        // User clicked 'No' or closed the dialog
      }
    });
  }
}
