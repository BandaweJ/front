/* eslint-disable prettier/prettier */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { UserDetailsModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectUserDetails, selectLoading, selectError } from '../../store/user-management.selectors';

@Component({
  selector: 'app-user-details-dialog',
  templateUrl: './user-details-dialog.component.html',
  styleUrls: ['./user-details-dialog.component.css']
})
export class UserDetailsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userDetails$ = this.store.select(selectUserDetails);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string }
  ) {}

  ngOnInit(): void {
    // Load user details
    this.store.dispatch(userManagementActions.loadUserDetails({ id: this.data.userId }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEditUser(): void {
    // TODO: Implement edit user functionality
    console.log('Edit user functionality to be implemented');
  }

  onResetPassword(): void {
    // TODO: Implement reset password functionality
    console.log('Reset password functionality to be implemented');
  }

  onViewActivity(): void {
    // TODO: Implement view activity functionality
    console.log('View activity functionality to be implemented');
  }

  getRoleDisplayName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getStatusColor(status: string): string {
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


