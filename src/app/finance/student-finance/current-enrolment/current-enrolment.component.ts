import { Component, Inject, Input, OnInit, Optional } from '@angular/core'; // <--- Import Optional
import { Store } from '@ngrx/store';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { selectCurrentEnrolment } from 'src/app/enrolment/store/enrolment.selectors';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';
import { Residence } from 'src/app/enrolment/models/residence.enum';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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

  constructor(
    private store: Store,
    // Add @Optional() decorator here
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { enrol: EnrolsModel }
  ) {
    // Your existing constructor logic will now work correctly:
    // If data is provided (from a dialog), it will use that.
    // If data is null (because it's not a dialog), it will fall back to the store.
    if (this.data && this.data.enrol) {
      this.currentEnrolment = this.data.enrol;
      this.editable = true; // Or set based on your dialog context
    } else {
      this.store.select(selectCurrentEnrolment).subscribe((enrolment) => {
        if (enrolment) {
          this.currentEnrolment = enrolment;
          // You might want to decide if `editable` should be true/false by default
          // when data comes from the store.
          // e.g., this.editable = false; // if it's display-only by default
        }
      });
    }
  }

  ngOnInit(): void {
    // This part ensures data is fetched if the component is used directly with studentNumber input
    if (this.studentNumber) {
      this.store.dispatch(
        currentEnrolementActions.fetchCurrentEnrolment({
          studentNumber: this.studentNumber,
        })
      );
    }
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
