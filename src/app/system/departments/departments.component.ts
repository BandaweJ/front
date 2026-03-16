import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { Subject, takeUntil } from 'rxjs';
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
  ],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  departments: DepartmentModel[] = [];

  displayedColumns: string[] = ['name', 'description'];

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly snackBar: MatSnackBar,
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
    this.userManagementService
      .getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
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
}

