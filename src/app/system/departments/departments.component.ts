import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  DepartmentModel,
} from '../../user-management/models/user-management.model';
import { UserManagementService } from '../../user-management/services/user-management.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  departments: DepartmentModel[] = [];
  newDeptName = '';
  newDeptDescription = '';
  saving = false;

  displayedColumns: string[] = ['name', 'description', 'actions'];

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDepartments(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.userManagementService
      .getDepartments()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open(
            'Failed to load departments',
            'Close',
            {
              duration: 4000,
              verticalPosition: 'top',
            },
          );
        },
      });
  }

  addDepartment(): void {
    const name = (this.newDeptName || '').trim();
    const description = (this.newDeptDescription || '').trim();

    if (!name) {
      this.snackBar.open('Department name is required', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    this.userManagementService
      .createDepartment({ name, description: description || undefined })
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (dept) => {
          this.departments = [...this.departments, dept].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          this.newDeptName = '';
          this.newDeptDescription = '';
          this.cdr.markForCheck();
          this.snackBar.open('Department created', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        error: () => {
          this.snackBar.open('Failed to create department', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
        },
      });
  }

  deleteDepartment(id: string): void {
    if (
      !confirm(
        'Delete this department? This may affect teachers currently assigned to it.',
      )
    ) {
      return;
    }

    this.userManagementService
      .deleteDepartment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.departments = this.departments.filter((d) => d.id !== id);
          this.cdr.markForCheck();
          this.snackBar.open('Department deleted', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        error: () => {
          this.snackBar.open('Failed to delete department', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
        },
      });
  }
}

