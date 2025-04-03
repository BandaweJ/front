import { Component, Input } from '@angular/core';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';

@Component({
  selector: 'app-current-enrolment',
  templateUrl: './current-enrolment.component.html',
  styleUrls: ['./current-enrolment.component.css'],
})
export class CurrentEnrolmentComponent {
  @Input() currentEnrolment!: EnrolsModel;
}
