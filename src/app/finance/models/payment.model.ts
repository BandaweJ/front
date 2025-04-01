import { StudentsModel } from 'src/app/registration/models/students.model';

export interface PaymentModel {
  receiptNumber?: number;
  receiptBookNumber: string;
  student: StudentsModel;
  amount: number;
  description: string;
  paymentDate?: Date;
}
