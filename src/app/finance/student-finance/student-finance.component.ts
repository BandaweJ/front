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

@Component({
  selector: 'app-student-finance',
  templateUrl: './student-finance.component.html',
  styleUrls: ['./student-finance.component.css'],
})
export class StudentFinanceComponent implements OnInit {
  selectedStudentEnrol: EnrolsModel | null = null;
  // currentTerm!: TermsModel;
  currentEnrolment$ = this.store
    .select(selectCurrentEnrolment)
    .subscribe((enrolment) => {
      this.selectedStudentEnrol = enrolment;
      // console.log('selectedStudentEnrol ', this.selectedStudentEnrol);
    });
  // today = new Date();
  constructor(private store: Store) {}

  ngOnInit(): void {
    // this.currentEnrolment$.subscribe((enrolment) => {
    //   this.selectedStudentEnrol = enrolment;
    //   // console.log('selectedStudentEnrol ', this.selectedStudentEnrol);
    // });
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
