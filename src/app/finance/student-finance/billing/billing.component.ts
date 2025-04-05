import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { feesActions } from '../../store/finance.actions';
import { FeesModel } from '../../models/fees.model';
import { selectFees } from '../../store/finance.selector';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class BillingComponent implements OnInit {
  fees$ = this.store.select(selectFees);
  constructor(private store: Store) {
    this.store.dispatch(feesActions.fetchFees());
  }

  ngOnInit(): void {}
}
