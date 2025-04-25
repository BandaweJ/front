import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  billStudentAction,
  feesActions,
  isNewComerActions,
} from '../../store/finance.actions';
import { FeesModel } from '../../models/fees.model';
import { selectFees, selectIsNewComer } from '../../store/finance.selector';
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

  ngOnInit(): void {}

  addToBill(fee: FeesModel) {
    if (this.enrolment?.student) {
      const index = this.selectedBills.findIndex(
        (selectedBill) => selectedBill.fees.id === fee.id
      );
      if (index === -1) {
        const bill: BillModel = {
          student: this.enrolment?.student,
          fees: fee,
          enrolment: this.enrolment,
        };

        this.selectedBills.push(bill);
      } else {
        // Remove the fee if it's already selected
        this.selectedBills = this.selectedBills.filter(
          (selectedBill) => selectedBill.fees.id !== fee.id
        );
      }
    }
  }

  isSelected(fee: FeesModel): boolean {
    return this.selectedBills.some(
      (selectedBill) => selectedBill.fees.id === fee.id
    );
  }

  removeFromBill(fee: FeesModel) {
    this.selectedBills = this.selectedBills.filter((f) => f.id !== fee.id);
  }

  billStudent() {
    this.store.dispatch(
      billStudentAction.billStudent({ bills: this.selectedBills })
    );
  }

  confirmBill() {
    this.openConfirmationDialog(
      'Are you sure you want to bill student with selected fees?'
    );
  }

  openConfirmationDialog(message: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px', // Adjust width as needed
      data: { message: message }, // Use the provided message
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
