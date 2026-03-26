export interface SubjectEntryDiagnosticsRow {
  markId: number;
  studentNumber: string;
  studentName: string;
  mark: number;
  comment: string;
  savedAt: string;
}

export interface SubjectEntryMissingStudent {
  studentNumber: string;
  studentName: string;
}

export interface SubjectEntryDiagnosticsResponse {
  filters: {
    num: number;
    year: number;
    termId: number | null;
    className: string;
    subjectCode: string;
    examType: string;
  };
  subject: {
    code: string;
    name: string;
  };
  totals: {
    enrolled: number;
    entered: number;
    missing: number;
  };
  enteredStudents: SubjectEntryDiagnosticsRow[];
  missingStudents: SubjectEntryMissingStudent[];
}
