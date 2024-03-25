import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import {
  addClassAction,
  editClassAction,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  // selectAddSuccess,
  selectEnrolErrorMsg,
} from 'src/app/enrolment/store/enrolment.selectors';

@Component({
  selector: 'app-add-edit-class',
  templateUrl: './add-edit-class.component.html',
  styleUrls: ['./add-edit-class.component.css'],
})
export class AddEditClassComponent implements OnInit {
  addClassForm!: FormGroup;
  errorMsg$!: Observable<string>;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditClassComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ClassesModel
  ) {}

  ngOnInit(): void {
    this.addClassForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      form: new FormControl('', [Validators.required]),
    });

    this.addClassForm.patchValue(this.data);

    // this.store.select(selectAddSuccess).subscribe((result) => {
    //   if (result === true) {
    //     this.snackBar.open('Class Added Successfully', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //     this.dialogRef.close();
    //   } else if (result === false) {
    //     this.snackBar.open('Faied to add Class. Check errors shown', '', {
    //       duration: 3500,
    //       verticalPosition: 'top',
    //     });
    //   }
    // });

    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
  }

  get name() {
    return this.addClassForm.get('name');
  }

  get form() {
    return this.addClassForm.get('form');
  }

  addClass() {
    let clas: ClassesModel = this.addClassForm.value;
    clas.form = Number(clas.form);

    if (this.data) {
      clas.id = this.data.id;

      this.store.dispatch(editClassAction({ clas }));
    }
    // console.log(teacher);
    else {
      this.store.dispatch(addClassAction({ clas }));
      // this.dialogRef.close(teacher);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
