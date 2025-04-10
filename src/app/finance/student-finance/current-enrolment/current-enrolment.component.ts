import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { selectCurrentEnrolment } from 'src/app/enrolment/store/enrolment.selectors';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';

@Component({
  selector: 'app-current-enrolment',
  templateUrl: './current-enrolment.component.html',
  styleUrls: ['./current-enrolment.component.css'],
})
export class CurrentEnrolmentComponent implements OnInit {
  @Input() studentNumber: string | null = null;
  currentEnrolment$ = this.store.select(selectCurrentEnrolment);

  constructor(private store: Store) {}

  ngOnInit(): void {
    if (this.studentNumber)
      this.store.dispatch(
        currentEnrolementActions.fetchCurrentEnrolment({
          studentNumber: this.studentNumber,
        })
      );
  }
}
