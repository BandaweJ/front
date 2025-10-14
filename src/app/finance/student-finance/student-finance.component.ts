import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { invoiceActions } from '../store/finance.actions';
import { InvoiceModel } from '../models/invoice.model';
import {
  selectedStudentInvoice,
  selectFechInvoiceError,
  selectLoadingInvoice,
} from '../store/finance.selector';

@Component({
  selector: 'app-student-finance',
  templateUrl: './student-finance.component.html',
  styleUrls: ['./student-finance.component.css'],
})
export class StudentFinanceComponent implements OnInit {
  // Simple observables from store
  terms$: Observable<TermsModel[]>;
  invoice$: Observable<InvoiceModel | null>;
  loadingInvoice$: Observable<boolean>;
  error$: Observable<string | null>;
  
  selectedTerm: TermsModel | null = null;
  selectedStudentNumber: string | null = null;
  selectedStudent: StudentsModel | null = null;

  constructor(private store: Store) {
    this.terms$ = this.store.select(selectTerms);
    this.invoice$ = this.store.select(selectedStudentInvoice);
    this.loadingInvoice$ = this.store.select(selectLoadingInvoice);
    this.error$ = this.store.select(selectFechInvoiceError);
  }

  ngOnInit(): void {
    // No subscriptions needed - using async pipe in template
  }

  selectedStudentChanged(student: StudentsModel): void {
    this.selectedStudent = student;
    this.selectedStudentNumber = student.studentNumber;
  }

  termChanged(term: TermsModel): void {
    this.selectedTerm = term;
  }

         generateInvoice(): void {
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
           }
         }

         saveInvoice(): void {
           // Get the current invoice from the store and save it
           this.invoice$.pipe(take(1)).subscribe(currentInvoice => {
             if (currentInvoice && currentInvoice.invoiceNumber) {
               this.store.dispatch(
                 invoiceActions.saveInvoice({ invoice: currentInvoice })
               );
             } else {
               console.warn('No invoice available to save. Please generate an invoice first.');
             }
           });
         }

  clearSelection(): void {
    this.selectedStudent = null;
    this.selectedStudentNumber = null;
    this.selectedTerm = null;
  }

  isFormValid(): boolean {
    return !!(this.selectedStudentNumber && this.selectedTerm);
  }
}
