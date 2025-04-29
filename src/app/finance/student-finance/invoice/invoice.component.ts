import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { invoiceActions } from '../../store/finance.actions';
import { InvoiceModel } from '../../models/invoice.model';
import {
  selectedStudentInvoice,
  selectIsNewComer,
} from '../../store/finance.selector';
import { MatTableDataSource } from '@angular/material/table';
import { BillModel } from '../../models/bill.model';
import { SharedService } from 'src/app/shared.service';

import { selectUser } from 'src/app/auth/store/auth.selectors';
import { selectCurrentEnrolment } from 'src/app/enrolment/store/enrolment.selectors';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit {
  @Input() studentNumber: string | null = null;
  invoice$ = this.store.select(selectedStudentInvoice);
  user$ = this.store.select(selectUser);
  isNewComer$ = this.store.select(selectIsNewComer);
  today = new Date();
  currentEnrolment!: EnrolsModel;

  id: string = '';

  // balanceBfwd: BalancesModel | undefined = undefined;
  balanceBroughtForward: number = 0;

  constructor(private store: Store, public sharedService: SharedService) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      if (user) {
        this.id = user.id;
        if (user.role === 'student') {
          this.studentNumber = user.id;
        }
      }
    });

    this.store.select(selectCurrentEnrolment).subscribe((enrol) => {
      if (enrol) this.currentEnrolment = enrol;
      if (this.studentNumber) {
        const studentNumber = this.studentNumber;
        const num = this.currentEnrolment.num;
        const year = this.currentEnrolment.year;

        this.store.dispatch(
          invoiceActions.fetchInvoice({ studentNumber, num, year })
        );
      }
    });
  }

  billsDisplayedColumns: string[] = ['class', 'term', 'fees', 'amount'];
  billsDataSource: MatTableDataSource<BillModel> =
    new MatTableDataSource<BillModel>([]);

  download() {
    if (this.currentEnrolment) {
      const studentNumber = this.currentEnrolment.student.studentNumber;
      const num = this.currentEnrolment.num;
      const year = this.currentEnrolment.year;

      this.store.dispatch(
        invoiceActions.downloadInvoice({ studentNumber, num, year })
      );
    }
  }
}
