import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { invoiceActions } from '../../store/finance.actions';
import { InvoiceModel } from '../../models/invoice.model';
import {
  selectedStudentInvoice,
  selectInVoices,
  selectInVoiceStats,
  selectIsNewComer,
} from '../../store/finance.selector';

import { SharedService } from 'src/app/shared.service';

import { selectUser } from 'src/app/auth/store/auth.selectors';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import {
  currentEnrolementActions,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { InvoiceItemComponent } from './invoice-item/invoice-item.component';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit {
  role = '';
  term!: TermsModel;
  terms$ = this.store.select(selectTerms);
  invoiceStats$ = this.store.select(selectInVoiceStats);
  invoices$ = this.store.select(selectInVoices);
  invoice!: InvoiceModel;

  constructor(private store: Store, public sharedService: SharedService) {
    this.store.dispatch(fetchTerms());
    this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });
  }

  ngOnInit(): void {}

  onTermChange(term: TermsModel) {
    this.term = term;
    this.store.dispatch(
      invoiceActions.fetchInvoiceStats({ num: term.num, year: term.year })
    );
    this.store.dispatch(
      invoiceActions.fetchInvoices({ num: term.num, year: term.year })
    );
  }

  onInvoiceSelected(invoice: InvoiceModel) {
    this.invoice = invoice;
  }

  namesToString(name: string) {
    switch (name) {
      case 'amount':
        return 'Amount';

      case 'tuition':
        return 'Tuition';
      case 'boarders':
        return 'Boarders';
      case 'dayScholars':
        return 'Day';
      case 'food':
        return 'Food';
      case 'transport':
        return 'Transport';
      case 'science':
        return 'Science Levy';
      case 'desk':
        return 'Desk Fee';
      case 'development':
        return 'Development';
      case 'application':
        return 'Application';
      default:
        return name;
    }
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   // console.log('enrolment in invoice (ngOnChanges): ', this.enrolment);
  //   if (changes['enrolment'] && changes['enrolment'].currentValue) {
  //     if (this.enrolment?.student?.studentNumber) {
  //       const studentNumber = this.enrolment.student.studentNumber;
  //       const num = this.enrolment.num;
  //       const year = this.enrolment.year;
  //       this.store.dispatch(
  //         invoiceActions.fetchInvoice({ studentNumber, num, year })
  //       );
  //     }
  //   }
  // }
}
