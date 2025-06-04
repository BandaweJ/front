import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { BillModel } from './bill.model';
import { BalancesModel } from './balances.model';
import { StudentsModel } from 'src/app/registration/models/students.model';

export interface InvoiceModel {
  totalBill: number; //total of all bills
  balanceBfwd: BalancesModel; //balance Bfwd if available
  student: StudentsModel;
  bills: BillModel[];
  balance: number; //sum of totalBill and balanceBfwd.amount
  enrol?: EnrolsModel;
  invoiceNumber?: string;
  invoiceDate: Date;
  invoiceDueDate: Date;
}
