import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { selectTermInvoices } from 'src/app/finance/store/finance.selector';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
})
export class InvoiceListComponent {
  @Output() invoiceSelected = new EventEmitter<InvoiceModel>();
  invoices$ = this.store.select(selectTermInvoices);
  constructor(private store: Store) {}

  selectInvoice(invoice: InvoiceModel) {
    this.invoiceSelected.emit(invoice);
  }
}
