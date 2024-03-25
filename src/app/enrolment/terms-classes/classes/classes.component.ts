import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ClassesModel } from '../../models/classes.model';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  deleteClassAction,
  fetchClasses,
  // resetAddSuccess,
} from '../../store/enrolment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AddEditClassComponent } from './add-edit-class/add-edit-class.component';
import {
  selectClasses,
  // selectDeleteSuccess,
  selectEnrolErrorMsg,
} from '../../store/enrolment.selectors';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css'],
})
export class ClassesComponent implements OnInit {
  classes$!: Observable<ClassesModel[]>;
  errorMsg$!: Observable<string>;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public title: Title
  ) {
    this.store.dispatch(fetchClasses());
  }

  displayedColumns: string[] = ['index', 'name', 'form', 'action'];

  public dataSource = new MatTableDataSource<ClassesModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.classes$ = this.store.select(selectClasses);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
    this.classes$.subscribe((classes) => (this.dataSource.data = classes));

    // this.store.select(selectDeleteSuccess).subscribe((result) => {
    //   if (result === true) {
    //     this.snackBar.open('Class Deleted Successfully', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   } else if (result === false) {
    //     this.snackBar.open('Faied to delete Class. Check errors shown', '', {
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

  openAddEditClassDialog() {
    const dialogRef = this.dialog.open(AddEditClassComponent);
    dialogRef.disableClose = true;
  }

  deleteClass(name: string) {
    // console.log(id);
    this.store.dispatch(deleteClassAction({ name }));
  }

  openEditClassDialog(data: ClassesModel) {
    this.dialog.open(AddEditClassComponent, { data });
  }
}
