import { ReportModel } from './report.model';

export interface ReportsModel {
  id?: number;
  num: number;
  year: number;
  name: string;
  studentNumber: string;
  report: ReportModel;
}
