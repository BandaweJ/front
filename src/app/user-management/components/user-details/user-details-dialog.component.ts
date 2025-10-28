/* eslint-disable prettier/prettier */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserManagementService } from '../../services/user-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { UserDetailsModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectUserDetails, selectLoading, selectError } from '../../store/user-management.selectors';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-details-dialog.component.html',
  styleUrls: ['./user-details-dialog.component.scss']
})
export class UserDetailsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userDetails$ = this.store.select(selectUserDetails);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; role: string },
    private userManagementService: UserManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.dispatch(userManagementActions.loadUserDetails({ id: this.data.userId, role: this.data.role }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEditUser(): void {
    // TODO: Open edit user dialog
    console.log('Edit user:', this.data.userId);
    // For now, just show the user info
    this.dialogRef.close({ action: 'edit' });
  }

  onResetPassword(): void {
    this.userManagementService.resetPassword(this.data.userId).subscribe({
      next: (response) => {
        this.snackBar.open(`Password reset successfully. Temporary password: ${response.temporaryPassword}`, 'Copy', {
          duration: 10000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        }).onAction().subscribe(() => {
          navigator.clipboard.writeText(response.temporaryPassword);
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to reset password', 'Close', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }
    });
  }

  onViewActivity(): void {
    // TODO: Open activity dialog
    console.log('View activity for:', this.data.userId);
    // For now, just close and show message
    alert('User activity logging - backend needs implementation');
  }

  getRoleDisplayName(role: string): string {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getStatusColor(status: string): string {
    if (!status) return 'primary';
    switch (status) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'warn';
      case 'suspended':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    if (!status) return 'help';
    switch (status) {
      case 'active':
        return 'check_circle';
      case 'inactive':
        return 'pause_circle';
      case 'suspended':
        return 'block';
      default:
        return 'help';
    }
  }
}
