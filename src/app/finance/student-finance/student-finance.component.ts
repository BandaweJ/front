import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { invoiceActions } from '../store/finance.actions';
import { InvoiceModel } from '../models/invoice.model';
import {
  selectedStudentInvoice,
  selectFechInvoiceError,
} from '../store/finance.selector';

@Component({
  selector: 'app-student-finance',
  templateUrl: './student-finance.component.html',
  styleUrls: ['./student-finance.component.css'],
})
export class StudentFinanceComponent implements OnInit, OnDestroy {
  // We no longer need these local properties to drive the child components
  // Instead, we will use the `invoice` property
  // selectedStudentEnrol: EnrolsModel | null = null;

  invoice: InvoiceModel | null = null;
  selectedTerm: TermsModel | null = null;
  selectedStudentNumber: string | null = null;

  terms$ = this.store.select(selectTerms);
  fetchInvoiceError$ = this.store.select(selectFechInvoiceError);

  private subscriptions: Subscription = new Subscription();

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Subscribe to the selected invoice from the store
    // This is the single source of truth for the student and enrolment data
    this.subscriptions.add(
      this.store.select(selectedStudentInvoice).subscribe((invoice) => {
        this.invoice = invoice;
      })
    );
  }

  // This method still updates the local studentNumber for fetching the invoice
  selectedStudentChanged(student: StudentsModel): void {
    this.selectedStudentNumber = student.studentNumber;
  }

  termChanged(term: TermsModel): void {
    this.selectedTerm = term;
  }

  fetchInvoice(): void {
    if (
      this.selectedStudentNumber &&
      this.selectedTerm?.num !== undefined &&
      this.selectedTerm?.year !== undefined
    ) {
      this.store.dispatch(
        invoiceActions.fetchInvoice({
          studentNumber: this.selectedStudentNumber,
          num: this.selectedTerm.num,
          year: this.selectedTerm.year,
        })
      );
    } else {
      console.warn('Cannot fetch invoice: Student or Term not selected.');
      // Clear the invoice if the request is invalid
      this.invoice = null;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
