import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { PaymentModel } from './payment.model';

export interface InvoiceModel {
  studentNumber: string;
  enrolments: EnrolsModel[];
  payments: PaymentModel[];
  balance: number;
}
