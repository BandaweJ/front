import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { SubjectsModel } from '../models/subjects.model';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as marksActions from '../store/marks.actions';
import { selectMarksErrorMsg, selectSubjects } from '../store/marks.selectors';
import { AddEditSubjectComponent } from './add-edit-subject/add-edit-subject.component';
import { deleteSubjectAction } from '../store/marks.actions';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css'],
})
export class SubjectsComponent {
  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.store.dispatch(marksActions.fetchSubjects());
  }

  private subjects$!: Observable<SubjectsModel[]>;
  private errorMsg$!: Observable<string>;

  public dataSource = new MatTableDataSource<SubjectsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'code', 'action'];

  ngOnInit(): void {
    this.subjects$ = this.store.select(selectSubjects);
    this.errorMsg$ = this.store.select(selectMarksErrorMsg);
    this.subjects$.subscribe((subjs) => {
      this.dataSource.data = subjs;
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

  openAddEditSubjectDialog() {
    this.dialog.open(AddEditSubjectComponent);
  }

  deleteSubject(subject: SubjectsModel) {
    this.store.dispatch(deleteSubjectAction({ subject }));
  }

  openEditSubjectDialog(data: SubjectsModel) {
    this.dialog.open(AddEditSubjectComponent, { data });
  }
}
