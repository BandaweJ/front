import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { PaymentModel } from './payment.model';
import { BillModel } from './bill.model';

export interface InvoiceModel {
  studentNumber: string;
  bills: BillModel[];
  payments: PaymentModel[];
  balance: number;
}
