import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserManagementService } from '../../services/user-management.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-reset-password-dialog',
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
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.scss']
})
export class ResetPasswordDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  manualPasswordForm: FormGroup;
  loading = false;
  generatedPassword: string | null = null;
  passwordVisible = false;
  confirmPasswordVisible = false;
  currentTheme: 'light' | 'dark' = 'light';

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    public themeService: ThemeService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.manualPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onGeneratePassword(): void {
    this.loading = true;
    this.userManagementService.resetPassword(this.data.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.generatedPassword = response.temporaryPassword;
          this.snackBar.open('Password generated successfully', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to generate password', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        }
      });
  }

  onSetManualPassword(): void {
    if (this.manualPasswordForm.valid) {
      this.loading = true;
      const newPassword = this.manualPasswordForm.get('newPassword')?.value;
      
      // TODO: Implement manual password setting in backend
      // For now, we'll use the reset password endpoint
      this.userManagementService.resetPassword(this.data.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.dialogRef.close(true);
            this.snackBar.open('Password updated successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open('Failed to update password', 'Close', {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
          }
        });
    }
  }

  onCopyPassword(): void {
    if (this.generatedPassword) {
      navigator.clipboard.writeText(this.generatedPassword).then(() => {
        this.snackBar.open('Password copied to clipboard', 'OK', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }).catch(() => {
        this.snackBar.open('Failed to copy password', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  getFieldError(fieldName: string): string {
    const field = this.manualPasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['passwordStrength']) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
    };
    return displayNames[fieldName] || fieldName;
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumeric || !hasSpecialChar) {
      return { passwordStrength: true };
    }
    return null;
  }

  private passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
