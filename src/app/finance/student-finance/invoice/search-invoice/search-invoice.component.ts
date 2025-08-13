import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import {
  debounceTime,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { selectAllInvoices } from 'src/app/finance/store/finance.selector';

@Component({
  selector: 'app-search-invoice',
  templateUrl: './search-invoice.component.html',
  styleUrls: ['./search-invoice.component.css'],
})
export class SearchInvoiceComponent {
  @Output() invoiceSelected = new EventEmitter<InvoiceModel>();

  searchControl = new FormControl('');
  searchResults$: Observable<InvoiceModel[]> = of([]);
  invoices$: Observable<InvoiceModel[]> = this.store.pipe(
    select(selectAllInvoices)
  );
  initialInvoices: InvoiceModel[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.invoices$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((invoices) => {
      this.initialInvoices = invoices;
      // Perform initial filtering if needed with an empty search term
      this.searchResults$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        map((searchTerm) =>
          this.filterInvoices(this.initialInvoices, searchTerm)
        )
      );
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  filterInvoices(
    invoices: InvoiceModel[],
    searchTerm: string | null
  ): InvoiceModel[] {
    if (!searchTerm?.trim()) {
      return invoices || [];
    }

    return (invoices || []).filter(
      (invoice) =>
        invoice.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.student.surname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.student.studentNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.student.email ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.student.cell ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.invoiceNumber ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }

  selectInvoice(invoice: InvoiceModel) {
    this.invoiceSelected.emit(invoice);
    this.searchControl.setValue('');
    // this.searchResults$ = of([]);
  }

  displayFn(invoice: InvoiceModel): string {
    return invoice && invoice.student.name
      ? `${invoice.student.studentNumber} ${invoice.student.name} ${invoice.student.surname} (${invoice.invoiceNumber})`
      : '';
  }
}
