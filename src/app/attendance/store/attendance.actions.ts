import { HttpErrorResponse } from '@angular/common/http';
import { createActionGroup, props } from '@ngrx/store';
import { RegisterModel } from '../models/register.model';

export const markRegisterActions = createActionGroup({
  source: 'Mark Register Component',
  events: {
    markRegister: props<{ attendance: RegisterModel; present: boolean }>(),
    markRegiterSuccess: props<{ attendance: RegisterModel }>(),
    markRegisterFail: props<{ error: HttpErrorResponse }>(),
    fetchTodayRegisterByClass: props<{
      name: string;
      num: number;
      year: number;
    }>(),
    fetchTodayRegisterByClassSuccess: props<{ attendances: RegisterModel[] }>(),
    fetchTodayRegisterByClassFail: props<{ error: HttpErrorResponse }>(),

    fetchDayRegisterByClass: props<{
      name: string;
      num: number;
      year: number;
    }>(),
    fetchDayRegisterByClassSuccess: props<{ attendances: RegisterModel[] }>(),
    fetchDayRegisterByClassFail: props<{ error: HttpErrorResponse }>(),
  },
});
