import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core'; // Import OnDestroy
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TermsModel } from '../../models/terms.model';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs'; // Import Subject
import { takeUntil } from 'rxjs/operators'; // Import takeUntil
import {
  selectClasses,
  selectEnrols,
  selectTerms,
} from '../../store/enrolment.selectors';
import { Title } from '@angular/platform-browser';
import { getEnrolmentByClass } from '../../store/enrolment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EnrolsModel } from '../../models/enrols.model';

// ADDED: Import jsPDF and html2canvas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// NEW: Import jspdf-autotable as a module
import { applyPlugin } from 'jspdf-autotable';

// IMPORTANT: Apply the plugin to the jsPDF object
applyPlugin(jsPDF);

// This is the custom interface that extends jsPDF and adds the autoTable method.
interface jsPDFWithPlugin extends jsPDF {
  autoTable: any;
}

@Component({
  selector: 'app-class-lists',
  templateUrl: './class-lists.component.html',
  styleUrls: ['./class-lists.component.css'],
})
export class ClassListsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Implement OnDestroy
  constructor(private store: Store, public title: Title) {
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  classes$ = this.store.select(selectClasses);
  terms$ = this.store.select(selectTerms);
  enrols$ = this.store.select(selectEnrols);
  classForm!: FormGroup;

  public totalBoys = 0;
  public totalGirls = 0;
  public totalBoarders = 0;
  public totalDayScholars = 0;

  public dataSource = new MatTableDataSource<EnrolsModel>();
  displayedColumns: string[] = [
    'studentNumber',
    'surname',
    'name',
    'gender',
    'residence',
  ];

  // Subject to signal component destruction
  private destroy$ = new Subject<void>(); // Added this

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.classForm = new FormGroup({
      term: new FormControl('', Validators.required),
      clas: new FormControl('', Validators.required),
    });

    this.enrols$
      .pipe(takeUntil(this.destroy$)) // Added takeUntil here
      .subscribe((enrols) => {
        this.dataSource.data = enrols;
        this.calculateSummary(enrols);
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Added this lifecycle hook
    this.destroy$.next(); // Emit a value to complete the destroy$ subject
    this.destroy$.complete(); // Complete the subject to ensure it's closed
  }

  get clas() {
    return this.classForm.get('clas');
  }

  get term() {
    return this.classForm.get('term');
  }

  fetchClassList() {
    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      // Optional: Add a snackbar/toast notification here to inform the user
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    this.store.dispatch(getEnrolmentByClass({ name, num, year }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  customFilterPredicate = (data: EnrolsModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    const dataStr = (
      data.student.studentNumber +
      data.student.surname +
      data.student.name +
      data.student.gender +
      (data.residence || '')
    ).toLowerCase();

    return dataStr.includes(searchString);
  };

  private calculateSummary(enrols: EnrolsModel[]): void {
    this.totalBoys = enrols.filter(
      (enrol) => enrol.student.gender === 'Male'
    ).length;
    this.totalGirls = enrols.filter(
      (enrol) => enrol.student.gender === 'Female'
    ).length;
    this.totalBoarders = enrols.filter(
      (enrol) => enrol.residence === 'Boarder'
    ).length;
    this.totalDayScholars = enrols.filter(
      (enrol) => enrol.residence === 'Day'
    ).length;
  }

  // Inside ClassListsComponent
  downloadPDF(): void {
    // Check if there is data to export
    if (!this.dataSource.data || this.dataSource.data.length === 0) {
      console.error('No class list data to download.');
      return;
    }

    const doc = new jsPDF() as any; // Cast jsPDF to any to access autoTable

    // Define the columns for the PDF table
    const head = [['Student Number', 'Surname', 'Name', 'Gender', 'Residence']];

    // Map your data to the format required by autoTable
    const body = this.dataSource.data.map((enrol) => [
      enrol.student.studentNumber,
      enrol.student.surname,
      enrol.student.name,
      enrol.student.gender,
      enrol.residence,
    ]);

    // Add a title to the document
    doc.setFontSize(18);
    const title = `Class List for ${this.clas?.value || 'Selected Class'}`;
    doc.text(title, 14, 20);

    // Add the summary to the PDF
    doc.setFontSize(12);
    const summaryText = `Boys: ${this.totalBoys}, Girls: ${this.totalGirls}, Boarders: ${this.totalBoarders}, Day Scholars: ${this.totalDayScholars}`;
    doc.text(summaryText, 14, 30);

    // This is the core autoTable call
    doc.autoTable({
      head: head,
      body: body,
      startY: 40, // Start the table below the title and summary
      theme: 'striped',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 50,
        fontStyle: 'bold',
      },
      styles: {
        cellPadding: 2,
        fontSize: 10,
      },
    });

    // Generate a filename and save the PDF
    const termValue = this.term?.value;
    const termName = termValue
      ? `Term_${termValue.num}_${termValue.year}`
      : 'Current_Term';
    const className = this.clas?.value || 'Class_List';

    const fileName = `${className}_${termName}.pdf`;
    doc.save(fileName);
  }
}
