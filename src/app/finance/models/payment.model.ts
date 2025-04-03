import { StudentsModel } from 'src/app/registration/models/students.model';
import { PaymentMethods } from './payment-methods.enum';

export interface PaymentModel {
  receiptNumber?: number;
  receiptBookNumber: string;
  student: StudentsModel;
  amount: number;
  description: string;
  paymentDate?: Date;
  method: PaymentMethods;
}
