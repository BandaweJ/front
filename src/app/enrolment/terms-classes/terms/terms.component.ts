import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core'; // Import OnDestroy and AfterViewInit
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import {
  deleteTermAction,
  fetchTerms,
  // resetAddSuccess, // Keep commented out if not used
} from '../../store/enrolment.actions';
import { Observable, Subject } from 'rxjs'; // Import Subject
import { takeUntil } from 'rxjs/operators'; // Import takeUntil
import { TermsModel } from '../../models/terms.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  // selectDeleteSuccess, // Keep commented out if not used
  selectEnrolErrorMsg,
  selectTerms,
} from '../../store/enrolment.selectors';
import { AddEditTermComponent } from './add-edit-term/add-edit-term.component';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common'; // Import DatePipe

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css'],
  providers: [DatePipe], // Provide DatePipe here if you want to use it for filtering
})
export class TermsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Implement OnDestroy
  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe // Inject DatePipe
  ) {
    this.store.dispatch(fetchTerms());
    this.dataSource.filterPredicate = this.customFilterPredicate; // Set custom predicate
  }

  private terms$!: Observable<TermsModel[]>;
  private errorMsg$!: Observable<string>;

  public dataSource = new MatTableDataSource<TermsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'num',
    'year',
    'startDate',
    'endDate',
    'action',
  ];

  private destroy$ = new Subject<void>(); // Subject for managing subscriptions

  ngOnInit(): void {
    this.terms$ = this.store.select(selectTerms);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);

    this.terms$
      .pipe(takeUntil(this.destroy$)) // Unsubscribe on component destroy
      .subscribe((terms) => {
        this.dataSource.data = terms;
      });

    // Uncomment and apply takeUntil if you decide to use these subscriptions
    // this.store.select(selectDeleteSuccess)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((result) => {
    //     if (result === true) {
    //       this.snackBar.open('Term Deleted Successfully', '', {
    //         duration: 3500,
    //         verticalPosition: 'top',
    //       });
    //     } else if (result === false) {
    //       this.snackBar.open('Failed to delete Term. Check errors shown', '', {
    //         duration: 3500,
    //         verticalPosition: 'top',
    //       });
    //     }
    //   });

    // this.dialog.afterAllClosed
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     this.store.dispatch(resetAddSuccess());
    //   });

    // You might also want to subscribe to errorMsg$ if you plan to show errors
    this.errorMsg$.pipe(takeUntil(this.destroy$)).subscribe((msg) => {
      if (msg) {
        this.snackBar.open(msg, 'Dismiss', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar'], // Optional: Add a class for styling error messages
        });
        // You might want to dispatch an action to clear the error message from the store after showing it
        // this.store.dispatch(clearEnrolErrorMsg()); // Assuming you have such an action
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddEditTermDialog() {
    this.dialog.open(AddEditTermComponent);
  }

  deleteTerm(term: TermsModel) {
    // You might want to add a confirmation dialog here before dispatching delete
    const confirmDelete = confirm(
      `Are you sure you want to delete Term ${term.num} ${term.year}?`
    );
    if (confirmDelete) {
      this.store.dispatch(deleteTermAction({ term }));
    }
  }

  openEditTermDialog(data: TermsModel) {
    this.dialog.open(AddEditTermComponent, { data });
  }

  /**
   * Custom filter predicate for MatTableDataSource to search TermsModel properties.
   * Filters by num, year, and formatted start/end dates.
   */
  customFilterPredicate = (data: TermsModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    // Convert all searchable properties to lowercase strings
    const numStr = data.num.toString().toLowerCase();
    const yearStr = data.year.toString().toLowerCase();
    const startDateStr =
      this.datePipe.transform(data.startDate, 'mediumDate')?.toLowerCase() ||
      ''; // Format date
    const endDateStr =
      this.datePipe.transform(data.endDate, 'mediumDate')?.toLowerCase() || ''; // Format date

    // Check if the search string is included in any of these properties
    return (
      numStr.includes(searchString) ||
      yearStr.includes(searchString) ||
      startDateStr.includes(searchString) ||
      endDateStr.includes(searchString)
    );
  };
}
