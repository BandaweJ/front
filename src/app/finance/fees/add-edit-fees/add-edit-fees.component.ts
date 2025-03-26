import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { FeesModel } from '../../models/fees.model';
import { Residence } from 'src/app/enrolment/models/residence.enum';
import { feesActions } from '../../store/finance.actions';
import { Title } from '@angular/platform-browser';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-add-edit-fees',
  templateUrl: './add-edit-fees.component.html',
  styleUrls: ['./add-edit-fees.component.css'],
})
export class AddEditFeesComponent implements OnInit {
  feesForm!: FormGroup;
  terms$ = this.store.select(selectTerms);
  residences = [...Object.values(Residence)];
  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: FeesModel,
    public title: Title
  ) {}

  ngOnInit(): void {
    this.feesForm = new FormGroup({
      amount: new FormControl('', Validators.required),
      term: new FormControl('', Validators.required),
      residence: new FormControl('', Validators.required),
      description: new FormControl(''),
    });

    if (this.data) {
      this.terms$
        .pipe(
          map((terms) =>
            terms.find(
              (term) =>
                term.num === this.data?.num && term.year === this.data?.year
            )
          )
        )
        .subscribe((term) => {
          this.feesForm.patchValue({
            amount: this.data?.amount,
            term: term,
            residence: this.data?.residence,
            description: this.data?.description,
          });
        });
    }
  }

  get amount() {
    return this.feesForm.get('amount');
  }

  get term() {
    return this.feesForm.get('term');
  }

  get residence() {
    return this.feesForm.get('residence');
  }

  get description() {
    return this.feesForm.get('description');
  }

  addFees() {
    const term: FeesModel = this.term?.value;
    const num = term.num;
    const year = term.year;
    const residence: Residence = this.residence?.value;
    const amount: number = this.amount?.value;
    const description = this.description?.value;

    const fee: FeesModel = {
      num,
      year,
      residence,
      amount: Number(amount),
      description,
    };

    if (this.data) {
      const id = this.data.id;
      if (id) this.store.dispatch(feesActions.editFee({ id, fee }));
    } else {
      this.store.dispatch(feesActions.addFee({ fee }));
    }
  }

  residenceToString(residence: Residence) {
    switch (residence) {
      case Residence.Boarder:
        return 'Boarder';
      case Residence.Day:
        return 'Day';
      case Residence.DayFood:
        return 'Day With Food';
      case Residence.DayTransport:
        return 'Day With Transport';
      case Residence.DayFoodTransport:
        return 'Day With Food and Transport';
    }
  }
}
