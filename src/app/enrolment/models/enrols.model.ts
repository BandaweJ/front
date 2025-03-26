import { StudentsModel } from 'src/app/registration/models/students.model';
import { Residence } from './residence.enum';

export interface EnrolsModel {
  id?: number;
  name: string;
  num: number;
  year: number;
  residence: Residence;
  student: StudentsModel;
}
