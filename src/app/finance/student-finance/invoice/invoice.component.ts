import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { invoiceActions } from '../../store/finance.actions';
import { InvoiceModel } from '../../models/invoice.model';
import { selectedStudentInvoice } from '../../store/finance.selector';
import { MatTableDataSource } from '@angular/material/table';
import { BillModel } from '../../models/bill.model';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit {
  @Input() studentNumber: string | null = null;
  invoice$ = this.store.select(selectedStudentInvoice);

  constructor(private store: Store, public sharedService: SharedService) {}

  ngOnInit(): void {
    if (this.studentNumber) {
      const studentNumber = this.studentNumber;
      this.store.dispatch(invoiceActions.fetchInvoice({ studentNumber }));
    }
    this.invoice$.subscribe((invoice) => {
      if (invoice?.bills) this.billsDataSource.data = invoice?.bills;
    });
  }

  displayedColumns: string[] = ['class', 'term', 'fees', 'amount'];
  billsDataSource!: MatTableDataSource<BillModel>;
}
