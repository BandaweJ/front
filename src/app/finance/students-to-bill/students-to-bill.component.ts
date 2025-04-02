import { Component, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectStudentsToBill } from '../store/finance.selector';
import { billingActions } from '../store/finance.actions';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { StudentsModel } from 'src/app/registration/models/students.model';

@Component({
  selector: 'app-students-to-bill',
  templateUrl: './students-to-bill.component.html',
  styleUrls: ['./students-to-bill.component.css'],
})
export class StudentsToBillComponent implements OnInit {
  constructor(private store: Store) {}

  studentsToBill$ = this.store.select(selectStudentsToBill);
  @Input() currentTerm!: TermsModel;
  @Output() selectedStudent!: StudentsModel;

  ngOnInit(): void {
    const num = this.currentTerm.num;
    const year = this.currentTerm.year;
    this.store.dispatch(billingActions.fetchStudentsToBill({ num, year }));
  }
}
