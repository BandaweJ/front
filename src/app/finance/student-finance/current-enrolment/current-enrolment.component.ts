import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { selectCurrentEnrolment } from 'src/app/enrolment/store/enrolment.selectors';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';
import { Residence } from 'src/app/enrolment/models/residence.enum';

@Component({
  selector: 'app-current-enrolment',
  templateUrl: './current-enrolment.component.html',
  styleUrls: ['./current-enrolment.component.css'],
})
export class CurrentEnrolmentComponent implements OnInit {
  @Input() studentNumber: string | undefined = undefined;
  editable = true;
  residences = [...Object.values(Residence)];
  currentEnrolment!: EnrolsModel;

  constructor(private store: Store) {
    this.store.select(selectCurrentEnrolment).subscribe((enrolment) => {
      if (enrolment) this.currentEnrolment = enrolment;
    });
  }

  ngOnInit(): void {
    if (this.studentNumber)
      this.store.dispatch(
        currentEnrolementActions.fetchCurrentEnrolment({
          studentNumber: this.studentNumber,
        })
      );
  }

  updateResidence(residence: Residence) {
    const enrolment: EnrolsModel = {
      ...this.currentEnrolment,
      residence,
    };
    this.store.dispatch(
      currentEnrolementActions.updateCurrentEnrolment({
        enrol: enrolment,
      })
    );
    this.editable = !this.editable;
  }
}
