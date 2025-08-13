import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core'; // Import OnDestroy
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs'; // Import Subject
import { takeUntil, tap } from 'rxjs/operators'; // Import takeUntil and tap
import { ClassesModel } from '../models/classes.model';
import { TermsModel } from '../models/terms.model';
import { EnrolsModel } from '../models/enrols.model';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
  selectEnrolErrorMsg, // Import error message selector
} from '../store/enrolment.selectors';
import {
  UnenrolStudentActions,
  fetchClasses,
  fetchTerms,
  getEnrolmentByClass,
} from '../store/enrolment.actions';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EnrolStudentComponent } from './enrol-student/enrol-student.component';
import { Title } from '@angular/platform-browser';
import { Residence } from '../models/residence.enum';
import { SharedService } from 'src/app/shared.service'; // Ensure this path is correct
import { CurrentEnrolmentComponent } from '../../finance/student-finance/current-enrolment/current-enrolment.component';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { User } from 'src/app/auth/models/user.model';

@Component({
  selector: 'app-terms-classes',
  templateUrl: './terms-classes.component.html',
  styleUrls: ['./terms-classes.component.css'],
})
export class TermsClassesComponent implements OnInit, AfterViewInit, OnDestroy {
  // Implement OnDestroy
  classes$!: Observable<ClassesModel[]>;
  terms$!: Observable<TermsModel[]>;
  enrols$!: Observable<EnrolsModel[]>;
  private errorMsg$!: Observable<string>;
  public dataSource = new MatTableDataSource<EnrolsModel>();
  enrolForm!: FormGroup;
  residences = [...Object.values(Residence)];
  role$!: Observable<User | null>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>(); // Subject for managing subscriptions

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public title: Title,
    public sharedService: SharedService
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
    // Set the custom filter predicate once in the constructor
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.enrols$ = this.store.select(selectEnrols);
    this.role$ = this.store.select(selectUser);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg); // Initialize errorMsg$

    this.enrols$
      .pipe(
        takeUntil(this.destroy$), // Unsubscribe when component is destroyed
        tap((enrols) => {
          this.dataSource.data = enrols;
          // Re-apply filter and sort if they are active, when data changes
          if (this.dataSource.filter) {
            this.dataSource.filter = this.dataSource.filter;
          }
          if (this.dataSource.sort) {
            this.dataSource.sort.active = this.dataSource.sort.active;
            this.dataSource.sort.direction = this.dataSource.sort.direction;
          }
        })
      )
      .subscribe();

    this.enrolForm = new FormGroup({
      clas: new FormControl('', [Validators.required]),
      term: new FormControl('', [Validators.required]),
    });
  }

  // Implement ngOnDestroy to clean up subscriptions
  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to signal destruction
    this.destroy$.complete(); // Complete the subject
  }

  get clas() {
    return this.enrolForm.get('clas');
  }

  get term() {
    return this.enrolForm.get('term');
  }

  displayedColumns = [
    'studentNumber',
    'surname',
    'name',
    'gender',
    'residence',
    'action',
  ];

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  fetchClassList() {
    if (this.enrolForm.invalid) {
      this.snackBar.open(
        'Please select both Class and Term to fetch student list.',
        'Close',
        { duration: 3000 }
      );
      this.enrolForm.markAllAsTouched();
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    this.store.dispatch(getEnrolmentByClass({ name, num, year }));
  }

  openEnrolStudentsDialog() {
    if (this.enrolForm.invalid) {
      this.snackBar.open(
        'Please select Class and Term before enrolling students.',
        'Close',
        { duration: 3000 }
      );
      this.enrolForm.markAllAsTouched();
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    const data = {
      name,
      num,
      year,
    };

    const dialogRef = this.dialog.open(EnrolStudentComponent, {
      data: data,
      height: '80vh',
      width: '70vw',
    });
    dialogRef.disableClose = true;
    // You might want to subscribe to afterClosed() here to refresh the list
    // dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
    //   this.fetchClassList(); // Refresh data after dialog closes
    // });
  }

  unenrolStudent(enrol: EnrolsModel) {
    // Add a confirmation dialog for unenrolling a student
    const confirmUnenrol = confirm(
      `Are you sure you want to unenrol ${enrol.student.name} ${enrol.student.surname}?`
    );
    if (confirmUnenrol) {
      this.store.dispatch(UnenrolStudentActions.unenrolStudent({ enrol }));
    }
  }

  /**
   * Custom filter predicate for MatTableDataSource to search within EnrolsModel.
   * Filters by student's number, surname, name, gender, and enrol's residence.
   * @param data The EnrolsModel object for the current row.
   * @param filter The filter string entered by the user.
   * @returns True if the row matches the filter, false otherwise.
   */
  customFilterPredicate = (data: EnrolsModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    // Explicitly concatenate all searchable fields, handling potential null/undefined
    const studentNumber =
      data.student?.studentNumber?.toString().toLowerCase() || '';
    const surname = data.student?.surname?.toLowerCase() || '';
    const name = data.student?.name?.toLowerCase() || '';
    const gender = data.student?.gender?.toLowerCase() || '';
    const residence = data.residence?.toLowerCase() || ''; // Assuming Residence enum can be converted to string

    // Combine all parts into a single searchable string
    const combinedString = `${studentNumber} ${surname} ${name} ${gender} ${residence}`;

    return combinedString.includes(searchString);
  };

  showCurrentEnrol(enrol: EnrolsModel) {
    const studentNumber = enrol.student.studentNumber;
    let dialogRef = this.dialog.open(CurrentEnrolmentComponent, {
      // height: '400px',
      // width: '600px',
      data: { enrol },
    });
  }
}
