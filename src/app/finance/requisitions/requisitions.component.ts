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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  CreateRequisitionPayload,
  Requisition,
  RequisitionsService,
} from './requisitions.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { RequisitionDetailDialogComponent } from './requisition-detail-dialog.component';

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
    MatDialogModule,
    RequisitionDetailDialogComponent,
  ],
  templateUrl: './requisitions.component.html',
  styleUrls: ['./requisitions.component.scss'],
})
export class RequisitionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form: FormGroup;
  myRequisitions: Requisition[] = [];
  approvalRequisitions: Requisition[] = [];
  pendingReceiving: Requisition[] = [];
  loading = false;
  role: ROLES | null = null;

  canCreate = false;
  canReceive = false;

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
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(500)]],
      items: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const auth = this.authService.getAuthStatus();
    this.role = auth.user?.role ?? null;
    this.canCreate =
      this.role === ROLES.hod ||
      this.role === ROLES.seniorTeacher ||
      this.role === ROLES.deputy ||
      this.role === ROLES.head;
    this.canReceive = this.role === ROLES.hod;

    if (this.items.length === 0) {
      this.addItemRow();
    }
    this.loadMyRequisitions();
    this.loadApprovalRequisitions();
    this.loadPendingReceiving();
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
    if (!this.canCreate) {
      this.snackBar.open('You are not allowed to create requisitions', 'Close', {
        duration: 4000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return;
    }
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
          this.myRequisitions = [req, ...this.myRequisitions];
          this.loadApprovalRequisitions();
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
          this.myRequisitions = data;
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

  private loadApprovalRequisitions(): void {
    // Approvers use the full list; we filter client-side by status + role.
    // Backend permissions still enforce access.
    this.requisitionsService
      .getAllRequisitions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const role = this.role;
          const all = data ?? [];
          if (role === ROLES.deputy) {
            this.approvalRequisitions = all.filter(
              (r) => r.status === 'in_review_deputy' || r.status === 'submitted',
            );
          } else if (role === ROLES.head) {
            this.approvalRequisitions = all.filter((r) => r.status === 'in_review_head');
          } else if (role === ROLES.auditor || role === ROLES.director) {
            this.approvalRequisitions = all.filter(
              (r) => r.status === 'awaiting_authorization',
            );
          } else {
            this.approvalRequisitions = [];
          }
        },
        error: () => {
          // Silent: users without permission may get 403; approval list will be empty.
          this.approvalRequisitions = [];
        },
      });
  }

  private loadPendingReceiving(): void {
    if (!this.canReceive) {
      this.pendingReceiving = [];
      return;
    }

    this.requisitionsService
      .getPendingReceiving()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.pendingReceiving = data ?? [];
        },
        error: () => {
          this.pendingReceiving = [];
        },
      });
  }

  openDetails(req: Requisition): void {
    if (!this.role) return;
    const ref = this.dialog.open(RequisitionDetailDialogComponent, {
      width: '860px',
      maxWidth: '95vw',
      data: { requisition: req, role: this.role },
    });

    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((updated?: Requisition) => {
      if (!updated) return;
      this.myRequisitions = this.myRequisitions.map((r) => (r.id === updated.id ? updated : r));
      this.approvalRequisitions = this.approvalRequisitions.map((r) =>
        r.id === updated.id ? updated : r,
      );
      this.pendingReceiving = this.pendingReceiving.map((r) =>
        r.id === updated.id ? updated : r,
      );
      this.loadApprovalRequisitions();
      this.loadPendingReceiving();
    });
  }
}

