import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { invoiceActions } from '../../store/finance.actions';
import { InvoiceModel } from '../../models/invoice.model';
import {
  selectedStudentInvoice,
  selectIsNewComer,
} from '../../store/finance.selector';

import { SharedService } from 'src/app/shared.service';

import { selectUser } from 'src/app/auth/store/auth.selectors';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit {
  @Input() enrolment!: EnrolsModel;
  @Input() downloadable: boolean = true;
  user$ = this.store.select(selectUser);
  isNewComer$ = this.store.select(selectIsNewComer);
  today = new Date();
  // currentEnrolment!: EnrolsModel;
  invoice!: InvoiceModel;

  role!: string;
  id: string = '';

  // balanceBfwd: BalancesModel | undefined = undefined;
  balanceBroughtForward: number = 0;

  constructor(private store: Store, public sharedService: SharedService) {
    this.store.select(selectedStudentInvoice).subscribe((invoice) => {
      this.invoice = invoice;
      // console.log(this.invoice.totalBill);
    });
  }

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      if (user) {
        this.role = user.role;
        this.id = user.id;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('enrolment in invoice (ngOnChanges): ', this.enrolment);
    if (changes['enrolment'] && changes['enrolment'].currentValue) {
      if (this.enrolment?.student?.studentNumber) {
        const studentNumber = this.enrolment.student.studentNumber;
        const num = this.enrolment.num;
        const year = this.enrolment.year;
        this.store.dispatch(
          invoiceActions.fetchInvoice({ studentNumber, num, year })
        );
      }
    }
  }

  save() {
    // console.log('called save');
    const invoice = this.invoice;

    this.store.dispatch(invoiceActions.saveInvoice({ invoice }));
  }

  download() {
    // console.log('called download');
    if (this.enrolment) {
      const studentNumber = this.enrolment.student.studentNumber;
      const num = this.enrolment.num;
      const year = this.enrolment.year;

      this.store.dispatch(
        invoiceActions.downloadInvoice({ studentNumber, num, year })
      );
    }
  }
}
