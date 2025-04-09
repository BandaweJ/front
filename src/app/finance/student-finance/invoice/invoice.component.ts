import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { invoiceActions } from '../../store/finance.actions';
import { InvoiceModel } from '../../models/invoice.model';
import { selectedStudentInvoice } from '../../store/finance.selector';
import { MatTableDataSource } from '@angular/material/table';
import { BillModel } from '../../models/bill.model';
import { SharedService } from 'src/app/shared.service';
import { PaymentModel } from '../../models/payment.model';
import { BalancesModel } from '../../models/balances.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit {
  @Input() studentNumber: string | null = null;
  invoice$ = this.store.select(selectedStudentInvoice);
  user$ = this.store.select(selectUser);
  id: string = '';
  totalBill: number = 0;
  totalPayments: number = 0;
  // balanceBfwd: BalancesModel | undefined = undefined;
  balanceBroughtForward: number = 0;

  constructor(private store: Store, public sharedService: SharedService) {}

  ngOnInit(): void {
    this.invoice$.subscribe((invoice) => {
      if (invoice?.bills) {
        this.billsDataSource.data = invoice?.bills;
        this.totalBill = invoice.bills.reduce((total, bill) => {
          if (bill.fees && typeof bill.fees.amount === 'number') {
            return total + bill.fees.amount;
          }
          return total;
        }, 0);
      }

      if (invoice?.balanceBfwd) {
        this.balanceBroughtForward = invoice.balanceBfwd.amount;
      }
      if (invoice?.payments) {
        this.paymentsDataSource.data = invoice?.payments;
        this.totalPayments = invoice.payments.reduce((total, payment) => {
          if (payment.amount && typeof payment.amount === 'number') {
            return total + payment.amount;
          }
          return total;
        }, 0);
      }
    });
    this.user$.subscribe((user) => {
      if (user) {
        this.id = user.id;
        if (user.role === 'student') {
          this.studentNumber = user.id;
        }
      }
    });
    if (this.studentNumber) {
      const studentNumber = this.studentNumber;
      this.store.dispatch(invoiceActions.fetchInvoice({ studentNumber }));
    }
  }

  billsDisplayedColumns: string[] = ['class', 'term', 'fees', 'amount'];
  billsDataSource: MatTableDataSource<BillModel> =
    new MatTableDataSource<BillModel>([]);

  paymentsDisplayedColumns: string[] = [
    'date',
    'receiptno',
    'method',
    'amount',
  ];
  paymentsDataSource: MatTableDataSource<PaymentModel> =
    new MatTableDataSource<PaymentModel>([]);
}
