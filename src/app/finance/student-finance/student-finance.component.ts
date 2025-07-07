import {
  currentEnrolementActions,
  fetchTerms,
} from './../../enrolment/store/enrolment.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs'; // For managing subscriptions
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  selectCurrentEnrolment,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
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
  // State variables for the component
  selectedStudentEnrol: EnrolsModel | null = null;
  invoice: InvoiceModel | null = null; // Initialize to null
  selectedTerm: TermsModel | null = null; // Initialize to null
  selectedStudentNumber: string | null = null; // NEW: To hold the studentNumber for invoice fetch

  // Observables for data from NgRx store
  terms$ = this.store.select(selectTerms);
  fetchInvoiceError$ = this.store.select(selectFechInvoiceError);

  // Private subscription to manage cleanup
  private subscriptions: Subscription = new Subscription();

  constructor(private store: Store) {
    // Dispatch action to load terms on component initialization
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    // Subscribe to the current enrolment from the store (for the other component)
    this.subscriptions.add(
      this.store.select(selectCurrentEnrolment).subscribe((enrolment) => {
        this.selectedStudentEnrol = enrolment;
        // NEW: If an invoice is present, update its 'enrol' property
        if (enrolment && this.invoice) {
          this.store.dispatch(
            invoiceActions.updateInvoiceEnrolment({ enrol: enrolment })
          );
        }
      })
    );

    // Subscribe to the selected invoice from the store
    this.subscriptions.add(
      this.store.select(selectedStudentInvoice).subscribe((invoice) => {
        this.invoice = invoice;
      })
    );
  }

  // Method called when a student is selected (e.g., from an autocomplete or list)
  selectedStudentChanged(student: StudentsModel): void {
    this.selectedStudentNumber = student.studentNumber; // Store the studentNumber

    // Dispatch action to fetch the current enrolment for the selected student
    // This is for the other component that needs 'selectedStudentEnrol'
    this.store.dispatch(
      currentEnrolementActions.fetchCurrentEnrolment({
        studentNumber: student.studentNumber,
      })
    );

    // After a student is selected, attempt to fetch the invoice
    // if a term is already selected.
    this.maybeFetchInvoice();
  }

  // Method called when a term is selected (e.g., from mat-select)
  termChanged(term: TermsModel): void {
    this.selectedTerm = term; // Update the local selectedTerm
    // After a term is selected, attempt to fetch the invoice
    // if a student is already selected.
    this.maybeFetchInvoice();
  }

  // Helper method to encapsulate the logic for fetching the invoice
  // This method now uses selectedStudentNumber directly.
  private maybeFetchInvoice(): void {
    // Ensure both a studentNumber AND a selected term are available
    if (
      this.selectedStudentNumber && // Check if a studentNumber has been set
      this.selectedTerm?.num !== undefined &&
      this.selectedTerm?.year !== undefined
    ) {
      this.store.dispatch(
        invoiceActions.fetchInvoice({
          studentNumber: this.selectedStudentNumber, // Use the stored studentNumber
          num: this.selectedTerm.num,
          year: this.selectedTerm.year,
        })
      );
    } else {
      this.invoice = null;
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
