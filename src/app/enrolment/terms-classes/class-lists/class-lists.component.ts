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
}
