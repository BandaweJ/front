import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FeesModel } from '../models/fees.model';
import { HttpErrorResponse } from '@angular/common/http';

export const feesActions = createActionGroup({
  source: 'Fees Component',
  events: {
    fetchFees: emptyProps(),
    fetchFeesSuccess: props<{ fees: FeesModel[] }>(),
    fetchFeesFail: props<{ error: HttpErrorResponse }>(),
    addFee: props<{ fee: FeesModel }>(),
    addFeeSuccess: props<{ fee: FeesModel }>(),
    addFeeFail: props<{ error: HttpErrorResponse }>(),
    editFee: props<{ fee: FeesModel }>(),
    editFeeSuccess: props<{ fee: FeesModel }>(),
    editFeeFail: props<{ error: HttpErrorResponse }>(),
  },
});
