import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SubjectsModel } from '../../models/subjects.model';
import { selectMarksErrorMsg } from '../../store/marks.selectors';
import {
  addSubjectAction,
  editSubjectActions,
} from '../../store/marks.actions';

@Component({
  selector: 'app-add-edit-subject',
  templateUrl: './add-edit-subject.component.html',
  styleUrls: ['./add-edit-subject.component.css'],
})
export class AddEditSubjectComponent implements OnInit {
  addSubjectForm!: FormGroup;
  errorMsg$!: Observable<string>;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditSubjectComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: SubjectsModel
  ) {}

  ngOnInit(): void {
    this.addSubjectForm = new FormGroup({
      code: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });

    this.addSubjectForm.patchValue(this.data);

    this.errorMsg$ = this.store.select(selectMarksErrorMsg);
  }

  get code() {
    return this.addSubjectForm.get('code');
  }

  get name() {
    return this.addSubjectForm.get('name');
  }

  addSubject() {
    let subject: SubjectsModel = this.addSubjectForm.value;

    if (this.data) {
      //dispacth edit subject action
      this.store.dispatch(editSubjectActions.editSubject({ subject }));
    } else {
      this.store.dispatch(addSubjectAction({ subject }));
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
