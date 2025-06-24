import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  addTermAction,
  editTermAction,
} from 'src/app/enrolment/store/enrolment.actions';
import { selectEnrolErrorMsg } from 'src/app/enrolment/store/enrolment.selectors';

@Component({
  selector: 'app-add-edit-term',
  templateUrl: './add-edit-term.component.html',
  styleUrls: ['./add-edit-term.component.css'],
})
export class AddEditTermComponent implements OnInit {
  addTermForm!: FormGroup;
  errorMsg$!: Observable<string>;

  constructor(
    public title: Title,
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditTermComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: TermsModel
  ) {}

  ngOnInit(): void {
    this.addTermForm = new FormGroup({
      num: new FormControl('', [Validators.required]),
      year: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });

    this.addTermForm.patchValue(this.data);

    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
  }

  get num() {
    return this.addTermForm.get('num');
  }

  get year() {
    return this.addTermForm.get('year');
  }

  get startDate() {
    return this.addTermForm.get('startDate');
  }

  get endDate() {
    return this.addTermForm.get('endDate');
  }

  addTerm() {
    let term: TermsModel = this.addTermForm.value;

    if (this.data) {
      // const date = term.endDate;
      // term.endDate = new Date(date.toISOString());
      // console.log(term);
      this.store.dispatch(editTermAction({ term }));
    } else {
      this.store.dispatch(addTermAction({ term }));
    }
  }
}
