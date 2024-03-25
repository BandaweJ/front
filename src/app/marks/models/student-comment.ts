import { StudentsModel } from 'src/app/registration/models/students.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';

export interface StudentComment {
  id?: number;
  comment: string;
  name: string;
  num: number;
  year: number;
  student: StudentsModel;
  teacher?: TeachersModel;
}
