import { Residence } from 'src/app/enrolment/models/residence.enum';

export interface FeesModel {
  id?: number;
  amount: number;
  num: number;
  year: number;
  residence: Residence;
  description?: string;
}
