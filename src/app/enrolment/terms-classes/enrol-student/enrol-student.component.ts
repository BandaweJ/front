import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnrolsModel } from '../../models/enrols.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { Store } from '@ngrx/store';
import * as registrationActions from '../../../registration/store/registration.actions';
import { selectStudents } from 'src/app/registration/store/registration.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { enrolStudents } from '../../store/enrolment.actions';
import { Observable } from 'rxjs';
import { selectEnrols } from '../../store/enrolment.selectors';

@Component({
  selector: 'app-enrol-student',
  templateUrl: './enrol-student.component.html',
  styleUrls: ['./enrol-student.component.css'],
})
export class EnrolStudentComponent implements OnInit, AfterViewInit {
  studentsToEnrol: StudentsModel[] = [];
  enrols!: EnrolsModel[];

  public dataSource = new MatTableDataSource<StudentsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['studentNumber', 'surname', 'name', 'gender', 'action'];

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<EnrolStudentComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { name: string; num: number; year: number }
  ) {
    this.store.dispatch(registrationActions.fetchStudents());
  }

  ngOnInit(): void {
    this.store.select(selectEnrols).subscribe((enrols) => {
      this.enrols = enrols;
    });
    this.store.select(selectStudents).subscribe((students) => {
      this.dataSource.data = students.filter((student) => {
        return !this.enrols.some(
          (enrol) => enrol.student.studentNumber === student.studentNumber
        );
      });
    });
  }

  addToEnrolList(student: StudentsModel) {
    // this.store.dispatch(enrolmentActions.addToEnrolList({ student }));
    //remove student from registered students array
    this.studentsToEnrol.push(student);
    this.dataSource.data = this.dataSource.data.filter(
      (st) => st.studentNumber !== student.studentNumber
    );
    //add student to students to enrol array
  }

  removeFromEnrolList(student: StudentsModel) {
    // this.store.dispatch(enrolmentActions.removeFromEnrolList({ student }));
    // this.dataSource.data.push(student);
    this.dataSource.data = [student, ...this.dataSource.data];
    this.studentsToEnrol = this.studentsToEnrol.filter(
      (st) => st.studentNumber !== student.studentNumber
    );
    // console.log(this.studentsToEnrol);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  enrolStudents() {
    const enrols: EnrolsModel[] = [];
    const enrolList = [...this.studentsToEnrol];

    if (enrolList.length) {
      enrolList.map((student) => {
        this.studentsToEnrol = this.studentsToEnrol.filter(
          (st) => st.studentNumber !== student.studentNumber
        );
        const enrol: EnrolsModel = {
          student,
          name: this.data.name,
          num: this.data.num,
          year: this.data.year,
          // id: '',
        };
        enrols.push(enrol);
      });
      // console.log(enrols);
      this.store.dispatch(enrolStudents({ enrols }));
    }
  }
}
