import { HttpErrorResponse } from '@angular/common/http';
import { createActionGroup, props } from '@ngrx/store';
import { ReportsModel } from 'src/app/reports/models/reports.model';

export const markSheetActions = createActionGroup({
  source: 'Mark sheet component',
  events: {
    fetchMarkSheet: props<{ name: string; num: number; year: number }>(),
    fechMarkSheetSuccess: props<{ reports: ReportsModel[] }>(),
    fetchMarkSheetFail: props<{ error: HttpErrorResponse }>(),
  },
});
