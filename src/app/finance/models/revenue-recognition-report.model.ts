// src/app/finance/models/revenue-recognition-report.model.ts

export interface RevenueRecognitionReportFilters {
  termId: number; // TermsModel.id
  classId?: string | null; // Optional: Filter by class ID
}

export interface RevenueRecognitionSummary {
  termName: string;
  className?: string; // Optional, will be 'All Classes' if not filtered by class
  totalInvoiced: number;
  totalOutstanding: number;
  studentCount: number;
}

export interface RevenueRecognitionReportData {
  asOfDate: Date; // Date the report was generated
  reportData: RevenueRecognitionSummary[];
}
