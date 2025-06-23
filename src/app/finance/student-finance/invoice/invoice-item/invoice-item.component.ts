import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-invoice-item',
  templateUrl: './invoice-item.component.html',
  styleUrls: ['./invoice-item.component.css'],
})
export class InvoiceItemComponent {
  constructor(public sharedService: SharedService, private store: Store) {}

  @Input() invoice!: InvoiceModel;
  @Input() downloadable!: boolean;

  save() {
    // console.log('called save with invoice ', this.invoice);
    const invoice = this.invoice;

    this.store.dispatch(invoiceActions.saveInvoice({ invoice }));
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
    }
  }
}
