import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  CreateRequisitionPayload,
  Requisition,
  RequisitionsService,
} from './requisitions.service';

@Component({
  selector: 'app-requisitions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './requisitions.component.html',
  styleUrls: ['./requisitions.component.scss'],
})
export class RequisitionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form: FormGroup;
  requisitions: Requisition[] = [];
  loading = false;

  displayedColumns: string[] = [
    'createdAt',
    'title',
    'department',
    'status',
    'items',
  ];

  constructor(
    private fb: FormBuilder,
    private requisitionsService: RequisitionsService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(500)]],
      items: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    if (this.items.length === 0) {
      this.addItemRow();
    }
    this.loadMyRequisitions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItemRow(): void {
    const group = this.fb.group({
      description: new FormControl('', [
        Validators.required,
        Validators.maxLength(255),
      ]),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
      intendedUse: new FormControl('', [Validators.maxLength(500)]),
    });
    this.items.push(group);
  }

  removeItemRow(index: number): void {
    if (this.items.length <= 1) {
      return;
    }
    this.items.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateRequisitionPayload = this.form.value;

    this.loading = true;
    this.requisitionsService
      .createRequisition(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (req) => {
          this.snackBar.open('Requisition submitted successfully', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.form.reset();
          this.items.clear();
          this.addItemRow();
          this.requisitions = [req, ...this.requisitions];
        },
        error: () => {
          this.snackBar.open('Failed to submit requisition', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        },
      });
  }

  private loadMyRequisitions(): void {
    this.requisitionsService
      .getMyRequisitions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.requisitions = data;
        },
        error: () => {
          this.snackBar.open(
            'Failed to load your requisitions',
            'Close',
            {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            },
          );
        },
      });
  }
}

