import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from '../models/classes.model';
import { TermsModel } from '../models/terms.model';
import { EnrolsModel } from '../models/enrols.model';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
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
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-terms-classes',
  templateUrl: './terms-classes.component.html',
  styleUrls: ['./terms-classes.component.css'],
})
export class TermsClassesComponent implements OnInit, AfterViewInit {
  classes$!: Observable<ClassesModel[]>;
  terms$!: Observable<TermsModel[]>;
  enrols$!: Observable<EnrolsModel[]>;
  private errorMsg$!: Observable<string>;
  public dataSource = new MatTableDataSource<EnrolsModel>();
  enrolForm!: FormGroup;
  residences = [...Object.values(Residence)];
  // selectedResidence: Residence = Residence.Boarder;
  // selectedResidence: { [studentNumber: string]: Residence } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public title: Title,
    public sharedService: SharedService
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
    // this.store.dispatch(fetchEnrols());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.enrols$ = this.store.select(selectEnrols);
    this.enrols$.subscribe((enrols) => {
      this.dataSource.filterPredicate = (data: EnrolsModel, filter: string) => {
        const surname = data.student?.surname.toString(); // Access nested property
        const name = data.student?.name.toString();
        const studentNumber = data.student?.studentNumber.toString();

        return (
          surname.indexOf(filter) !== -1 ||
          name.indexOf(filter) !== -1 ||
          studentNumber.indexOf(filter) !== -1
        );
      };

      this.dataSource.data = enrols;

      //init selected residence values.
      // enrols.forEach((enrol) => {
      //   this.selectedResidence[enrol.student.studentNumber] = enrol.residence;
      // });
    });

    // Customize the filterPredicate

    this.enrolForm = new FormGroup({
      clas: new FormControl('', [Validators.required]),
      term: new FormControl('', [Validators.required]),
    });
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
    // 'cell',
    // 'address',
    // 'prevSchool',
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
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    // console.log(`Name: ${name}, Num: ${num}, Year: ${year}`);
    this.store.dispatch(getEnrolmentByClass({ name, num, year }));
  }

  openEnrolStudentsDialog() {
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
  }

  unenrolStudent(enrol: EnrolsModel) {
    this.store.dispatch(UnenrolStudentActions.unenrolStudent({ enrol }));
  }

  // updateResidence(resi: string, enrol: EnrolsModel) {
  //   const residence = resi as Residence;
  //   const updatedEnrol = { ...enrol, residence };
  //   console.log(updatedEnrol);
  //   // this.store.dispatch(updateEnrol({ enrol }));
  // }

  // updateResidence(row: EnrolsModel): void {
  //   // Create a new EnrolsModel object with the updated residence
  //   const updatedRow: EnrolsModel = {
  //     ...row,
  //     residence: this.selectedResidence[row.student.studentNumber],
  //   };

  //   // Update the dataSource.data array
  //   // this.dataSource.data = this.dataSource.data.map((item) =>
  //   //   item === row ? updatedRow : item
  //   // );

  //   // Perform any other necessary logic (e.g., dispatch an action to update the backend)
  //   console.log('Residence updated:', updatedRow);
  // }
}
