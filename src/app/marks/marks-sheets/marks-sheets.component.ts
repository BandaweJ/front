import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'; // Import ElementRef and ViewChild
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { markSheetActions } from './store/actions';
import { selectIsLoading, selectMarkSheet } from './store/selectors';
import { ReportsModel } from 'src/app/reports/models/reports.model';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { SubjectsModel } from '../models/subjects.model';
import { SubjectInfoModel } from 'src/app/reports/models/subject-info.model';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ExamType } from '../models/examtype.enum';

@Component({
  selector: 'app-marks-sheets',
  templateUrl: './marks-sheets.component.html',
  styleUrls: ['./marks-sheets.component.css'],
})
export class MarksSheetsComponent implements OnInit {
  @ViewChild('marksheetTable') marksheetTable!: ElementRef; // Reference to the main table
  @ViewChild('tableHeader') tableHeader!: ElementRef; // Reference to the caption + <th> row
  @ViewChild('tempTableContainer') tempTableContainer!: ElementRef; // Reference for the temporary div

  markSheetForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  isLoading$!: Observable<boolean>;
  markSheet$!: Observable<ReportsModel[]>;
  reports!: ReportsModel[];
  subjects: SubjectsModel[] = [];
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  constructor(
    private store: Store,
    private dialog: MatDialog,
    public title: Title
  ) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.isLoading$ = this.store.select(selectIsLoading);

    this.store.select(selectMarkSheet).subscribe((reps) => {
      const modifiedReports: ReportsModel[] = [];
      const subjectsArr: SubjectsModel[] = [];
      reps.forEach((rep) => {
        rep.report.subjectsTable.forEach((subj) => {
          const code = subj.subjectCode;
          const name = subj.subjectName;
          const newSubj = { code, name };
          const found = subjectsArr.find((sbj) => sbj.code === newSubj.code);
          if (!found) {
            subjectsArr.push(newSubj);
          }
        });
      });
      subjectsArr.sort((a, b) => +a.code - +b.code);
      this.subjects = [...subjectsArr];

      reps.map((rep) => {
        const newSubjectsTable = Array<SubjectInfoModel>(this.subjects.length);
        rep.report.subjectsTable.map((subjInfo) => {
          const code = subjInfo.subjectCode;
          const name = subjInfo.subjectName;
          const subjPosInSubjsArr = this.subjects.findIndex(
            (sbj) => sbj.code === code && sbj.name === name
          );
          newSubjectsTable[subjPosInSubjsArr] = subjInfo;
        });
        const newReport: ReportsModel = {
          ...rep,
          report: {
            ...rep.report,
            subjectsTable: newSubjectsTable,
          },
        };
        modifiedReports.push(newReport);
      });

      this.reports = [...modifiedReports];
    });

    this.markSheetForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      examType: new FormControl('', [Validators.required]),
    });
  }

  get term() {
    return this.markSheetForm.get('term');
  }

  get clas() {
    return this.markSheetForm.get('clas');
  }

  get examType() {
    return this.markSheetForm.get('examType');
  }

  fetchMarkSheet() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    const examType = this.examType?.value;

    this.store.dispatch(
      markSheetActions.fetchMarkSheet({ name, num, year, examType })
    );
  }

  // --- Mark Sheet Table Data - Adjusted download function ---
  async download() {
    const pdf = new jspdf.jsPDF('l', 'cm', 'a4'); // Landscape A4
    const pageHeightCm = pdf.internal.pageSize.getHeight(); // 21 cm for A4 landscape
    const pageWidthCm = pdf.internal.pageSize.getWidth(); // 29.7 cm for A4 landscape

    // Define content area margins (adjust as needed)
    const margin = 1; // 1 cm margin on all sides
    const usableHeightCm = pageHeightCm - 2 * margin; // Usable height for content
    const usableWidthCm = pageWidthCm - 2 * margin; // Usable width for content

    // Ensure reports data is available
    if (!this.reports || this.reports.length === 0) {
      console.warn('No reports data to generate PDF.');
      return;
    }

    // Capture the header once (caption + th row)
    const headerElement = document.querySelector(
      '#marksheet caption, #marksheet thead tr'
    ) as HTMLElement; // Combined selector
    let headerImageBase64: string | null = null;
    let headerHeightPx = 0;

    if (headerElement) {
      // Temporarily move the element to measure its rendered height accurately
      const originalParent = headerElement.parentNode;
      const originalNextSibling = headerElement.nextSibling;

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width =
        this.marksheetTable.nativeElement.offsetWidth + 'px'; // Match table width
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(headerElement.cloneNode(true)); // Append a clone

      const headerCanvas = await html2canvas(tempContainer, {
        scale: 4,
        logging: false,
      });
      headerImageBase64 = headerCanvas.toDataURL('image/png');
      headerHeightPx = headerCanvas.height;

      // Clean up tempContainer and restore original header (if moved, not needed with clone)
      document.body.removeChild(tempContainer);
    } else {
      console.warn(
        'Table header (caption or thead) not found. PDF might not have headers.'
      );
    }

    // Calculate approx. header height in cm
    // This assumes a certain DPI/pixels per cm ratio. Adjust `pixelsPerCm` if needed.
    const pixelsPerCm = 96 / 2.54; // Assuming 96 DPI, 2.54 cm per inch
    const headerHeightCm = headerHeightPx / pixelsPerCm;
    const initialY = margin + headerHeightCm + 0.2; // Start content below header + a small gap

    let currentY = initialY;
    let pageAdded = false; // Flag to check if content has been added to the current page

    // Create a temporary table element to hold rows for rendering
    const tempTable = document.createElement('table');
    tempTable.style.borderCollapse = 'collapse';
    tempTable.style.width =
      this.marksheetTable.nativeElement.offsetWidth + 'px'; // Match original table width
    tempTable.style.position = 'absolute'; // Position off-screen
    tempTable.style.left = '-9999px';
    tempTable.style.top = '-9999px';
    document.body.appendChild(tempTable); // Add to body to be rendered by html2canvas

    // Clone the original `<th>` row to use for temporary tables
    const originalHeaderRow =
      this.marksheetTable.nativeElement.querySelector('tr');
    let clonedHeaderRow: HTMLTableRowElement | null = null;
    if (originalHeaderRow) {
      clonedHeaderRow = originalHeaderRow.cloneNode(
        true
      ) as HTMLTableRowElement;
      // Remove caption if it's there, as we handle it separately
      const captionInClone = clonedHeaderRow
        .closest('table')
        ?.querySelector('caption');
      if (captionInClone) captionInClone.remove();
    }

    const rows = Array.from(
      this.marksheetTable.nativeElement.querySelectorAll('tr')
    );
    // Filter out the initial header row (caption is already handled above)
    const dataRows: HTMLTableRowElement[] = rows.slice(
      1
    ) as HTMLTableRowElement[]; // Assuming the first 'tr' is the header row, adjust if needed

    // Determine approximate row height. This is crucial for pre-calculating page breaks.
    // A more precise way would be to render a single row off-screen and measure it.
    // For now, let's estimate based on typical line heights and padding from your CSS.
    // Given your CSS padding: 2px 5px, it's quite small.
    const approximateRowHeightCm = 0.5; // You'll likely need to adjust this value!
    // Render one row, measure it, convert px to cm.

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowClone = row.cloneNode(true) as HTMLTableRowElement; // Clone the row

      // If this is the start of a new page, ensure the header is present in the temp table
      // or just add it to the PDF separately. We will add to PDF separately for simplicity.

      // Check if adding the next row would exceed the page height
      // This is an estimation. For precise breaks, you'd render and measure.
      if (currentY + approximateRowHeightCm > usableHeightCm && pageAdded) {
        // Render the current batch of rows to a canvas
        const canvas = await html2canvas(tempTable, {
          scale: 4,
          logging: false,
        });
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = usableWidthCm;
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          currentY - imgHeight,
          imgWidth,
          imgHeight
        ); // Adjust Y to place it correctly

        pdf.addPage();
        currentY = initialY; // Reset Y for new page
        pageAdded = false; // Reset flag for new page

        // Clear the temporary table for the new page's content
        tempTable.innerHTML = '';
        // Add the cloned header row to the temporary table for the next page's context, if needed for html2canvas
        // Or just rely on the fixed header image on each page.
        if (clonedHeaderRow) {
          const tbody = document.createElement('tbody');
          tbody.appendChild(clonedHeaderRow.cloneNode(true));
          tempTable.appendChild(tbody);
        }

        // Add the fixed header image to the new page
        if (headerImageBase64) {
          pdf.addImage(
            headerImageBase64,
            'PNG',
            margin,
            margin,
            usableWidthCm,
            headerHeightCm
          );
        }
      }

      // Append the row to the temporary table
      if (!tempTable.querySelector('tbody')) {
        tempTable.appendChild(document.createElement('tbody'));
      }
      tempTable.querySelector('tbody')?.appendChild(rowClone);
      currentY += approximateRowHeightCm; // Increment estimated Y position
      pageAdded = true;
    }

    // Render any remaining rows on the last page
    if (tempTable.innerHTML !== '') {
      const canvas = await html2canvas(tempTable, { scale: 4, logging: false });
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = usableWidthCm;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Position on the current (last) page. Adjust Y based on content height.
      // It's tricky to get `currentY` exactly right for the last partial page.
      // A simpler way: if content exists, add it.
      pdf.addImage(imgData, 'PNG', margin, initialY, imgWidth, imgHeight);
    }

    // Get the dynamic file name from reports[0]
    const fileName = `Term ${this.reports[0].num} ${this.reports[0].year}, ${this.reports[0].name} Marksheet.pdf`;
    pdf.save(fileName);

    // Clean up the temporary table
    document.body.removeChild(tempTable);

    // this.store.dispatch(generatePdfActions.generatePdfSuccess());
  }
}
