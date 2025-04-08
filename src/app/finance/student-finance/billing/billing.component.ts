import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { feesActions } from '../../store/finance.actions';
import { FeesModel } from '../../models/fees.model';
import { selectFees } from '../../store/finance.selector';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { BillModel } from '../../models/bill.model';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class BillingComponent implements OnInit {
  fees$ = this.store.select(selectFees);
  @Input() enrolment: EnrolsModel | null = null;
  // selectedFees: FeesModel[] = [];
  selectedBills: BillModel[] = [];

  constructor(private store: Store) {
    this.store.dispatch(feesActions.fetchFees());
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

  billStudent() {}
}
