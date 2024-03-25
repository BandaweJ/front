import { StudentsModel } from 'src/app/registration/models/students.model';

export interface EnrolsModel {
  id?: number;
  name: string;
  num: number;
  year: number;
  student: StudentsModel;
}
