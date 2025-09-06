import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
import { SharedService } from 'src/app/shared.service';
import { ExemptionType } from '../../../enums/exemption-type.enum'; // Import ExemptionType
import { BillModel } from 'src/app/finance/models/bill.model';
import { FeesNames } from 'src/app/finance/enums/fees-names.enum';

@Component({
  selector: 'app-invoice-item',
  templateUrl: './invoice-item.component.html',
  styleUrls: ['./invoice-item.component.css'],
})
export class InvoiceItemComponent {
  constructor(public sharedService: SharedService, private store: Store) {}

  @Input() invoice!: InvoiceModel | null;
  @Input() downloadable!: boolean;

  // Add a helper method to determine the display value for the exemption
  getExemptionDisplayAmount(): number | null {
    if (!this.invoice || !this.invoice.exemption) {
      return null;
    }

    const exemption = this.invoice.exemption;
    switch (exemption.type) {
      case ExemptionType.FIXED_AMOUNT:
        return exemption.fixedAmount || 0;

      case ExemptionType.STAFF_SIBLING:

      case ExemptionType.PERCENTAGE:
        // Calculate percentage of totalBill. Assuming totalBill is the gross amount.
        // You might need to adjust this logic based on how your backend calculates/applies exemptions.

        return (
          this.invoice.totalBill * (exemption.percentageAmount! / 100) || 0
        );
      default:
        return null;
    }
  }

  save() {
    // console.log('called save with invoice ', this.invoice);
    const invoice = this.invoice;
    if (invoice) {
      this.store.dispatch(invoiceActions.saveInvoice({ invoice }));
    }
  }

  download() {
    if (this.invoice && this.invoice.invoiceNumber) {
      this.store.dispatch(
        invoiceActions.downloadInvoice({
          invoiceNumber: this.invoice.invoiceNumber,
        })
      );
    } else {
      console.warn(
        'Cannot download invoice: Invoice object or invoice number is missing.'
      );
      //
    }
  }

  private _getGrossBillAmount(bills: BillModel[]): number {
    return bills.reduce((sum, bill) => sum + (bill.fees?.amount || 0), 0);
  }

  private _calculateExemptionAmount(invoiceData: InvoiceModel): number {
    if (!invoiceData.exemption || !invoiceData.exemption.type) {
      return 0;
    }

    const exemption = invoiceData.exemption;
    let calculatedAmount = 0;

    switch (exemption.type) {
      case ExemptionType.FIXED_AMOUNT:
        if (
          exemption.fixedAmount !== undefined &&
          exemption.fixedAmount !== null
        ) {
          calculatedAmount = exemption.fixedAmount;
        }
        break;
      case ExemptionType.PERCENTAGE:
        if (
          exemption.percentageAmount !== undefined &&
          exemption.percentageAmount !== null
        ) {
          const grossBillAmount = this._getGrossBillAmount(invoiceData.bills);
          calculatedAmount =
            grossBillAmount * (exemption.percentageAmount / 100);
        }
        break;
      case ExemptionType.STAFF_SIBLING:
        let totalFoodFee = 0;
        let totalOtherFees = 0;

        invoiceData.bills.forEach((bill) => {
          if (bill.fees) {
            if (bill.fees.name === FeesNames.foodFee) {
              totalFoodFee += bill.fees.amount;
            } else {
              totalOtherFees += bill.fees.amount;
            }
          }
        });

        calculatedAmount += totalFoodFee * 0.5;
        calculatedAmount += totalOtherFees;
        break;
      default:
        calculatedAmount = 0;
    }
    return calculatedAmount;
  }
}
