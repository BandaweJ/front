import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FeesModel } from '../../models/fees.model';
import { feesActions } from '../../store/finance.actions';
import { Title } from '@angular/platform-browser';
import { SharedService } from 'src/app/shared.service';
import { FeesNames } from '../../enums/fees-names.enum';

@Component({
  selector: 'app-add-edit-fees',
  templateUrl: './add-edit-fees.component.html',
  styleUrls: ['./add-edit-fees.component.css'],
})
export class AddEditFeesComponent implements OnInit {
  feesForm!: FormGroup;
  feesNames = [...Object.values(FeesNames)];
  constructor(
    private store: Store,
    @Inject(MAT_DIALOG_DATA)
    public data: FeesModel,
    public title: Title,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.feesForm = new FormGroup({
      amount: new FormControl('', Validators.required),
      description: new FormControl(''),
      name: new FormControl('', Validators.required),
    });

    if (this.data) {
      this.feesForm.patchValue(this.data);
    }
  }

  get amount() {
    return this.feesForm.get('amount');
  }

  get description() {
    return this.feesForm.get('description');
  }

  get name() {
    return this.feesForm.get('name');
  }

  addFees() {
    const amount: number = this.amount?.value;
    const description = this.description?.value;
    const name = this.name?.value;

    const fee: FeesModel = {
      amount: Number(amount),
      description,
      name,
    };

    if (this.data) {
      const id = this.data.id;
      if (id) this.store.dispatch(feesActions.editFee({ id, fee }));
    } else {
      this.store.dispatch(feesActions.addFee({ fee }));
    }
  }
}
