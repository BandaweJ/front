import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { markSheetActions } from './store/actions';

@Component({
  selector: 'app-marks-sheets',
  templateUrl: './marks-sheets.component.html',
  styleUrls: ['./marks-sheets.component.css'],
})
export class MarksSheetsComponent implements OnInit {
  reportsForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;

  constructor(private store: Store) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    this.reportsForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
    });
  }

  get term() {
    return this.reportsForm.get('term');
  }

  get clas() {
    return this.reportsForm.get('clas');
  }

  fetchMarkSheet() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;

    this.store.dispatch(markSheetActions.fetchMarkSheet({ name, num, year }));
  }
}
