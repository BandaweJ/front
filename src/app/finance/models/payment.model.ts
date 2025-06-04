import { StudentsModel } from 'src/app/registration/models/students.model';
import { PaymentMethods } from './payment-methods.enum';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';

export interface ReceiptModel {
  id?: number;
  receiptNumber: string;
  receiptBookNumber?: string;
  student: StudentsModel;
  amountPaid: number;
  description: string;
  paymentDate: Date;
  paymentMethod: PaymentMethods;
  approved: boolean;
  servedBy: string;
  enrol: EnrolsModel;
  amountOutstanding: number; //amount left owing after payment
  amountDue: number; //amount that was supposed to be paid (balance)
}
