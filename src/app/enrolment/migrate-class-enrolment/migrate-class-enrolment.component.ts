import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import {
  fetchClasses,
  fetchTerms,
  migrateClassActions,
} from '../store/enrolment.actions';
import { Observable } from 'rxjs';
import { TermsModel } from '../models/terms.model';
import { ClassesModel } from '../models/classes.model';
import { selectClasses, selectTerms } from '../store/enrolment.selectors';

@Component({
  selector: 'app-migrate-class-enrolment',
  templateUrl: './migrate-class-enrolment.component.html',
  styleUrls: ['./migrate-class-enrolment.component.css'],
})
export class MigrateClassEnrolmentComponent implements OnInit {
  migrateForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;

  constructor(public title: Title, private store: Store) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.terms$ = this.store.select(selectTerms);
    this.classes$ = this.store.select(selectClasses);

    this.migrateForm = new FormGroup({
      fromName: new FormControl('', [Validators.required]),
      fromTerm: new FormControl('', [Validators.required]),
      toName: new FormControl('', [Validators.required]),
      toTerm: new FormControl('', [Validators.required]),
    });
  }

  get fromTerm() {
    return this.migrateForm.get('fromTerm');
  }

  get fromName() {
    return this.migrateForm.get('fromName');
  }

  get toName() {
    return this.migrateForm.get('toName');
  }

  get toTerm() {
    return this.migrateForm.get('toTerm');
  }

  migrateClass() {
    const fromName = this.fromName?.value;
    const fromTerm: TermsModel = this.fromTerm?.value;
    const fromNum = fromTerm.num;
    const fromYear = fromTerm.year;

    const toName = this.toName?.value;
    const toTerm: TermsModel = this.toTerm?.value;
    const toNum = toTerm.num;
    const toYear = toTerm.year;

    this.store.dispatch(
      migrateClassActions.migrateClassEnrolment({
        fromName,
        fromNum,
        fromYear,
        toName,
        toNum,
        toYear,
      })
    );
  }
}
