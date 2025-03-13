import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectIsLoading,
  selectRegErrorMsg,
  selectTeachers,
} from '../../store/registration.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { TeachersModel } from '../../models/teachers.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-teachers-summary-list',
  templateUrl: './teachers-summary-list.component.html',
  styleUrls: ['./teachers-summary-list.component.css'],
})
export class TeachersSummaryListComponent implements OnInit {
  constructor(private store: Store, public title: Title) {}

  public dataSource = new MatTableDataSource<TeachersModel>();
  teachers$ = this.store.select(selectTeachers);
  public isLoading$ = this.store.select(selectIsLoading);
  public errorMsg$ = this.store.select(selectRegErrorMsg);

  ngOnInit(): void {
    this.teachers$.subscribe((teachers) => {
      this.dataSource.data = teachers;
    });
  }
  //  displayedColumns: string[] = ['id', 'name', 'progress', 'fruit'];
  displayedColumns: string[] = [
    'title',
    'surname',
    'name',
    'role',
    'cell',
    'email',

    'action',
  ];
  // dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
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
}
