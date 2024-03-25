import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  // selectAddSuccess,
  // selectDeleteSuccess,
  selectRegErrorMsg,
} from '../../store/registration.selectors';
import { StudentsModel } from '../../models/students.model';
import {
  addStudentAction,
  editStudentAction,
} from '../../store/registration.actions';
import * as moment from 'moment';
import { resetErrorMessage } from 'src/app/auth/store/auth.actions';

@Component({
  selector: 'app-add-edit-student',
  templateUrl: './add-edit-student.component.html',
  styleUrls: ['./add-edit-student.component.css'],
})
export class AddEditStudentComponent {
  genders = ['Male', 'Female'];
  addStudentForm!: FormGroup;
  errorMsg$!: Observable<string>;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditStudentComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: StudentsModel
  ) {}

  ngOnInit(): void {
    this.addStudentForm = new FormGroup({
      idnumber: new FormControl(''),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      surname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      dob: new FormControl(''),
      // gender: new FormControl('', [Validators.required]),
      gender: new FormControl(''),

      dateOfJoining: new FormControl(''),

      // cell: new FormControl('', [Validators.minLength(10)]),
      // email: new FormControl('', [Validators.email]),

      cell: new FormControl(''),
      email: new FormControl(''),

      address: new FormControl(''),
      prevSchool: new FormControl(''),
      studentNumber: new FormControl(''),
      role: new FormControl('student'),
    });

    this.addStudentForm.patchValue(this.data);

    // this.store.dispatch(resetErrorMessage()),
    //   this.store.select(selectAddSuccess).subscribe((result) => {
    //     if (result === true) {
    //       this.snackBar.open('Student Added Successfully', '', {
    //         duration: 3500,
    //         verticalPosition: 'top',
    //       });
    //       this.dialogRef.close();
    //     } else if (result === false) {
    //       this.snackBar.open('Faied to add Student. Check errors shown', '', {
    //         duration: 3500,
    //         verticalPosition: 'top',
    //       });
    //     }
    //   });

    this.errorMsg$ = this.store.select(selectRegErrorMsg);
  }

  get cell() {
    return this.addStudentForm.get('cell');
  }

  get email() {
    return this.addStudentForm.get('email');
  }

  get gender() {
    return this.addStudentForm.get('gender');
  }

  get title() {
    return this.addStudentForm.get('title');
  }

  get surname() {
    return this.addStudentForm.get('surname');
  }

  get dateOfJoining() {
    return this.addStudentForm.get('dateOfJoining');
  }

  get name() {
    return this.addStudentForm.get('name');
  }

  get idnumber() {
    return this.addStudentForm.get('idnumber');
  }

  get dob() {
    return this.addStudentForm.get('dob');
  }

  get dateOfLeaving() {
    return this.addStudentForm.get('dateOfLeaving');
  }

  get studentNumber() {
    return this.addStudentForm.get('studentNumber');
  }

  get prevSchool() {
    return this.addStudentForm.get('prevSchool');
  }

  addStudent() {
    let student: StudentsModel = this.addStudentForm.value;

    //Capitalise name and surname
    student.name =
      student.name.charAt(0).toUpperCase() +
      student.name.substring(1).toLowerCase();

    student.surname =
      student.surname.charAt(0).toUpperCase() +
      student.surname.substring(1).toLowerCase();

    if (!student.dob) {
      student.dob = new Date();
    }

    if (!student.dateOfJoining) {
      student.dateOfJoining = new Date();
    }

    student.role = 'student';

    if (this.data) {
      this.store.dispatch(editStudentAction({ student }));
    }
    // console.log(teacher);
    else {
      this.store.dispatch(addStudentAction({ student }));
      // this.dialogRef.close(teacher);
    }
  }

  changeDatePickerDob(): any {
    this.dob?.setValue(moment(this.dob.value.expireDate).format('YYYY-MM-DD'));
  }

  changeDatePickerDoj(): any {
    this.dateOfJoining?.setValue(
      moment(this.dateOfJoining.value.expireDate).format('YYYY-MM-DD')
    );
  }

  closeDialog() {
    this.dialogRef.close();
    // this.snackBar.open('Student Add Closed. No Student Added', '', {
    //   duration: 3500,
    //   verticalPosition: 'top',
    // });
  }
}
