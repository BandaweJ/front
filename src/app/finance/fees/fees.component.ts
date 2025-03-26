import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { feesActions } from '../store/finance.actions';
import { selectFees } from '../store/finance.selector';
import { MatTableDataSource } from '@angular/material/table';
import { FeesModel } from '../models/fees.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AddEditFeesComponent } from './add-edit-fees/add-edit-fees.component';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.css'],
})
export class FeesComponent implements OnInit {
  fees$ = this.store.select(selectFees);
  public dataSource = new MatTableDataSource<FeesModel>();

  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog
  ) {
    this.store.dispatch(feesActions.fetchFees());
  }

  ngOnInit(): void {
    this.fees$.subscribe((fees) => {
      console.log('Fees data from store:', fees); // Add this line
      this.dataSource.data = fees;
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['num', 'year', 'residence', 'amount', 'action'];

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

  openAddFeesDialog() {
    this.dialog.open(AddEditFeesComponent);
  }

  // deleteFees(fee: FeesModel) {}

  openEditFeesDialog(fee: FeesModel) {
    this.dialog.open(AddEditFeesComponent, { data: fee });
  }

  deleteFees(fee: FeesModel) {
    if (fee.id) this.store.dispatch(feesActions.deleteFee({ id: fee.id }));
  }
}
