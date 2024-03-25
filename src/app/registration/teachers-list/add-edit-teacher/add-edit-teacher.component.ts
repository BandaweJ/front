import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TeachersModel } from '../../models/teachers.model';
import {
  addTeacherAction,
  editTeacherAction,
} from '../../store/registration.actions';
import * as moment from 'moment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  // selectAddSuccess,
  selectRegErrorMsg,
} from '../../store/registration.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ROLES } from '../../models/roles.enum';

@Component({
  selector: 'app-add-edit-teacher',
  templateUrl: './add-edit-teacher.component.html',
  styleUrls: ['./add-edit-teacher.component.css'],
})
export class AddEditTeacherComponent implements OnInit {
  genders = ['Male', 'Female'];
  titles = ['Prof', 'Dr', 'Mr', 'Mrs', 'Miss', 'Ms'];
  addTeacherForm!: FormGroup;
  errorMsg$!: Observable<string>;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditTeacherComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: TeachersModel
  ) {}

  ngOnInit(): void {
    this.addTeacherForm = new FormGroup({
      id: new FormControl('', [Validators.required, Validators.minLength(10)]),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      surname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      dob: new FormControl(''),
      gender: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      dateOfJoining: new FormControl(''),
      dateOfLeaving: new FormControl(''),
      qualifications: new FormArray([]),
      cell: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      address: new FormControl(''),
      role: new FormControl(''),
    });

    this.addTeacherForm.patchValue(this.data);
    this.data.qualifications.map((item) => {
      const qual = new FormControl(item);
      this.qualifications.push(qual);
    });

    // this.store.select(selectAddSuccess).subscribe((result) => {
    //   if (result === true) {
    //     this.snackBar.open('Teacher Added Successfully', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //     this.dialogRef.close();
    //   } else if (result === false) {
    //     this.snackBar.open('Faied to add Teacher. Check errors shown', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   }
    // });

    this.errorMsg$ = this.store.select(selectRegErrorMsg);
  }

  get role() {
    return this.addTeacherForm.get('role');
  }

  get qualifications() {
    return this.addTeacherForm.get('qualifications') as FormArray;
  }

  get cell() {
    return this.addTeacherForm.get('cell');
  }

  get email() {
    return this.addTeacherForm.get('email');
  }

  get gender() {
    return this.addTeacherForm.get('gender');
  }

  get title() {
    return this.addTeacherForm.get('title');
  }

  get surname() {
    return this.addTeacherForm.get('surname');
  }

  get dateOfJoining() {
    return this.addTeacherForm.get('dateOfJoining');
  }

  get name() {
    return this.addTeacherForm.get('name');
  }

  get id() {
    return this.addTeacherForm.get('id');
  }

  get dob() {
    return this.addTeacherForm.get('dob');
  }

  get dateOfLeaving() {
    return this.addTeacherForm.get('dateOfLeaving');
  }

  addTeacher() {
    let teacher: TeachersModel = this.addTeacherForm.value;

    // teacher.role = ROLES.teacher;
    //capitalise name and surname
    teacher.name =
      teacher.name.charAt(0).toUpperCase() +
      teacher.name.substring(1).toLowerCase();
    teacher.surname =
      teacher.surname.charAt(0).toUpperCase() +
      teacher.surname.substring(1).toLowerCase();

    if (!teacher.dob) {
      teacher.dob = new Date().toISOString();
    }

    if (!teacher.dateOfJoining) {
      teacher.dateOfJoining = new Date().toISOString();
    }

    if (!teacher.dateOfLeaving) {
      teacher.dateOfLeaving = new Date().toISOString();
    }

    if (this.data) {
      this.store.dispatch(editTeacherAction({ teacher }));
    }
    // console.log(teacher);
    else {
      this.store.dispatch(addTeacherAction({ teacher }));
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

  changeDatePickerDol(): any {
    this.dateOfLeaving?.setValue(
      moment(this.dateOfLeaving.value.expireDate).format('YYYY-MM-DD')
    );
  }

  addControl() {
    const qual = new FormControl('');
    this.qualifications.push(qual);
  }

  delete(qualIndex: number) {
    this.qualifications.removeAt(qualIndex);
  }

  closeDialog() {
    this.dialogRef.close(null);
  }
}
