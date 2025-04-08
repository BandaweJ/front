import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { PaymentModel } from './payment.model';
import { BillModel } from './bill.model';
import { BalancesModel } from './balances.model';
import { StudentsModel } from 'src/app/registration/models/students.model';

export interface InvoiceModel {
  balanceBfwd: BalancesModel;
  student: StudentsModel;
  bills: BillModel[];
  payments: PaymentModel[];
  balance: number;
}
