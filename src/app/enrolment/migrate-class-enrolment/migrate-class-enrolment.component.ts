import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  fetchClasses,
  fetchTerms,
  migrateClassActions,
} from '../store/enrolment.actions';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, tap, map, startWith } from 'rxjs/operators';
import { TermsModel } from '../models/terms.model';
import { ClassesModel } from '../models/classes.model';
import { selectClasses, selectTerms, selectEnrolErrorMsg, selectMigrateClassResult } from '../store/enrolment.selectors';

@Component({
  selector: 'app-migrate-class-enrolment',
  templateUrl: './migrate-class-enrolment.component.html',
  styleUrls: ['./migrate-class-enrolment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrateClassEnrolmentComponent implements OnInit, OnDestroy {
  migrateForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  errorMsg$!: Observable<string>;
  migrateResult$!: Observable<boolean>;
  
  isLoading = false;
  destroy$ = new Subject<void>();

  constructor(
    public title: Title, 
    private store: Store,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.migrateForm = new FormGroup({
      fromName: new FormControl('', [Validators.required]),
      fromTerm: new FormControl('', [Validators.required]),
      toName: new FormControl('', [Validators.required]),
      toTerm: new FormControl('', [Validators.required]),
    });
  }

  private setupObservables(): void {
    this.terms$ = this.store.select(selectTerms);
    this.classes$ = this.store.select(selectClasses);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
    this.migrateResult$ = this.store.select(selectMigrateClassResult);

    // Handle error messages
    this.errorMsg$.pipe(
      takeUntil(this.destroy$),
      tap(errorMsg => {
        if (errorMsg) {
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      })
    ).subscribe();

    // Handle migration result
    this.migrateResult$.pipe(
      takeUntil(this.destroy$),
      tap(result => {
        if (result) {
          this.snackBar.open('Class migration completed successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.migrateForm.reset();
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      })
    ).subscribe();
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

  migrateClass(): void {
    if (this.migrateForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

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

  private markFormGroupTouched(): void {
    Object.keys(this.migrateForm.controls).forEach(key => {
      const control = this.migrateForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormErrorMessage(controlName: string): string {
    const control = this.migrateForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    return '';
  }

  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      fromName: 'Source Class',
      fromTerm: 'Source Term',
      toName: 'Destination Class',
      toTerm: 'Destination Term'
    };
    return fieldNames[controlName] || controlName;
  }

  canMigrate(): boolean {
    const fromName = this.fromName?.value;
    const fromTerm = this.fromTerm?.value;
    const toName = this.toName?.value;
    const toTerm = this.toTerm?.value;

    // Check if all fields are filled and source != destination
    return !!(fromName && fromTerm && toName && toTerm) && 
           !(fromName === toName && fromTerm?.num === toTerm?.num && fromTerm?.year === toTerm?.year);
  }
}
