import { StudentsModel } from 'src/app/registration/models/students.model';
import { PaymentMethods } from './payment-methods.enum';

export interface ReceiptModel {
  receiptNumber: number;
  receiptBookNumber?: string;
  student: StudentsModel;
  amountPaid: number;
  description: string;
  paymentDate?: Date;
  paymentMethod: PaymentMethods;
  approved: boolean;
  servedBy: string;
  amountOutstanding: number;
  amountDue: number;
}
