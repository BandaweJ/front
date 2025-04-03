import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { StudentsModel } from 'src/app/registration/models/students.model';

@Component({
  selector: 'app-student-finance',
  templateUrl: './student-finance.component.html',
  styleUrls: ['./student-finance.component.css'],
})
export class StudentFinanceComponent implements OnInit {
  selectedStudentEnrol: EnrolsModel | null = null;
  currentTerm!: TermsModel;
  today = new Date();
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectTerms)
      .pipe(
        tap((terms) =>
          terms.map((term) => {
            // console.log('Terms :', terms);
            if (
              new Date(term.startDate) < this.today &&
              new Date(term.endDate) > this.today
            ) {
              this.currentTerm = term;

              // console.log('Found it : ', term);
            }
          })
        )
      )
      .subscribe();
  }

  selectedEnrolChanged(enrol: EnrolsModel) {
    this.selectedStudentEnrol = enrol;
    // console.log(this.selectedStudentEnrol);
  }
}
