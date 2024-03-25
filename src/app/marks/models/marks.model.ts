import { StudentsModel } from 'src/app/registration/models/students.model';
import { SubjectsModel } from './subjects.model';

export interface MarksModel {
  id?: number;
  num: number;
  name: string;
  year: number;
  mark: number | null;
  comment: string;
  subject: SubjectsModel;
  student: StudentsModel;
}
