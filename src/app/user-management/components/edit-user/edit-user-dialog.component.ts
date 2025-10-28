import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserManagementService } from '../../services/user-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  editUserForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editUserForm = this.fb.group({
      username: [data.user?.username || '', [Validators.required, Validators.minLength(3)]],
      name: [data.user?.name || '', [Validators.required]],
      surname: [data.user?.surname || ''],
      email: [data.user?.email || '', [Validators.email]],
      cell: [data.user?.cell || ''],
      address: [data.user?.address || ''],
      active: [data.user?.active !== undefined ? data.user.active : true],
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.editUserForm.valid) {
      this.loading = true;
      const formValue = this.editUserForm.value;
      
      // Update account (username)
      const accountUpdate$ = this.userManagementService.updateUser(this.data.userId, {
        username: formValue.username
      });

      // Update profile based on role
      let profileUpdate$;
      if (this.data.role === 'student') {
        // Use students endpoint
        // This would need a proper students service endpoint
        profileUpdate$ = null;
      } else if (['teacher', 'admin', 'hod', 'reception', 'auditor', 'director'].includes(this.data.role)) {
        // Use teachers endpoint  
        profileUpdate$ = null; // TODO: Add proper endpoint
      }

      accountUpdate$.subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'User updated successfully', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to update user', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getFieldError(fieldName: string): string {
    const field = this.editUserForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      name: 'Name',
      surname: 'Surname',
      email: 'Email',
      cell: 'Phone',
      address: 'Address',
    };
    return displayNames[fieldName] || fieldName;
  }
}

