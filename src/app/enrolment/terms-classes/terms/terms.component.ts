import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import {
  deleteTermAction,
  fetchTerms,
  // resetAddSuccess,
} from '../../store/enrolment.actions';
import { Observable } from 'rxjs';
import { TermsModel } from '../../models/terms.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  // selectDeleteSuccess,
  selectEnrolErrorMsg,
  selectTerms,
} from '../../store/enrolment.selectors';
import { AddEditTermComponent } from './add-edit-term/add-edit-term.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css'],
})
export class TermsComponent implements OnInit {
  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.store.dispatch(fetchTerms());
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

  ngOnInit(): void {
    this.terms$ = this.store.select(selectTerms);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
    this.terms$.subscribe((terms) => {
      this.dataSource.data = terms;
    });

    // this.store.select(selectDeleteSuccess).subscribe((result) => {
    //   if (result === true) {
    //     this.snackBar.open('Term Deleted Successfully', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   } else if (result === false) {
    //     this.snackBar.open('Faied to delete Term. Check errors shown', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   }
    // });

    // this.dialog.afterAllClosed.subscribe(() => {
    //   this.store.dispatch(resetAddSuccess());
    // });
  }

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

  openAddEditTermDialog() {
    this.dialog.open(AddEditTermComponent);
  }

  deleteTerm(term: TermsModel) {
    this.store.dispatch(deleteTermAction({ term }));
  }

  openEditTermDialog(data: TermsModel) {
    this.dialog.open(AddEditTermComponent, { data });
  }
}
