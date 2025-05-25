import { currentEnrolementActions } from './../../enrolment/store/enrolment.actions';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  selectCurrentEnrolment,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { invoiceActions } from '../store/finance.actions';
import { InvoiceModel } from '../models/invoice.model';
import { selectedStudentInvoice } from '../store/finance.selector';

@Component({
  selector: 'app-student-finance',
  templateUrl: './student-finance.component.html',
  styleUrls: ['./student-finance.component.css'],
})
export class StudentFinanceComponent implements OnInit {
  selectedStudentEnrol: EnrolsModel | null = null;
  invoice!: InvoiceModel;
  // currentTerm!: TermsModel;
  currentEnrolment$ = this.store
    .select(selectCurrentEnrolment)
    .subscribe((enrolment) => {
      this.selectedStudentEnrol = enrolment;
      if (enrolment) {
        this.store.dispatch(
          invoiceActions.fetchInvoice({
            studentNumber: enrolment.student.studentNumber,
            num: enrolment.num,
            year: enrolment.year,
          })
        );
      }
    });
  // today = new Date();
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectedStudentInvoice).subscribe((invoice) => {
      console.log('invoice came from store', invoice);
      this.invoice = invoice;
    });
  }

  selectedEnrolChanged(enrol: EnrolsModel) {
    this.selectedStudentEnrol = enrol;
    // console.log(this.selectedStudentEnrol);
  }

  selectedStudentChanged(student: StudentsModel) {
    this.selectedStudentEnrol = null;
    this.store.dispatch(
      currentEnrolementActions.fetchCurrentEnrolment({
        studentNumber: student.studentNumber,
      })
    );
  }
}
