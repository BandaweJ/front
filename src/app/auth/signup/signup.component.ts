import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SignupInterface } from '../models/signup.model';
import { resetErrorMessage, signupActions } from '../store/auth.actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isLoading, selectErrorMsg } from '../store/auth.selectors';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store, 
    private router: Router,
    private title: Title,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Sign Up - School Management System');
    
    this.errorMsg$ = this.store.select(selectErrorMsg);
    this.isLoading$ = this.store.select(isLoading);
    this.store.dispatch(resetErrorMessage());

    this.initializeForm();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  signupForm!: FormGroup;
  hide = true;
  roles = [...Object.values(ROLES)];
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  formSubmitted = false;

  private initializeForm(): void {
    this.signupForm = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      role: new FormControl('', Validators.required),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]),
    });
  }

  private setupFormValidation(): void {
    // Real-time validation feedback
    this.id?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.id?.markAsTouched();
        }
      });

    this.username?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.username?.markAsTouched();
        }
      });

    this.password?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.password?.markAsTouched();
        }
      });
  }

  signup(): void {
    this.formSubmitted = true;
    
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      this.showValidationErrors();
      return;
    }

    const signupData: SignupInterface = {
      id: this.signupForm.value.id.trim(),
      role: this.signupForm.value.role,
      username: this.signupForm.value.username.trim(),
      password: this.signupForm.value.password
    };

    this.store.dispatch(signupActions.signup({ signupData }));
  }

  switchToSignIn(): void {
    this.router.navigateByUrl('/signin');
  }

  // Helper methods for dynamic field labels and hints
  getPlaceholder(): string {
    const role = this.role?.value;
    if (role === 'teacher') {
      return '03123456F98';
    } else if (role === 'student') {
      return 'S2405234';
    } else if (role === 'parent') {
      return 'parent@example.com';
    }
    return 'Enter your identifier';
  }

  getHint(): string {
    const role = this.role?.value;
    if (role === 'teacher') {
      return 'Format: 03123456F98';
    } else if (role === 'student') {
      return 'Format: S2405234';
    } else if (role === 'parent') {
      return 'Format: parent@example.com';
    }
    return 'Enter your identifier';
  }

  getFieldLabel(): string {
    const role = this.role?.value;
    if (role === 'teacher') {
      return 'I.D Number';
    } else if (role === 'student') {
      return 'Student Number';
    } else if (role === 'parent') {
      return 'Email Address';
    }
    return 'Identifier';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  private showValidationErrors(): void {
    const errors: string[] = [];
    
    if (this.role?.hasError('required')) {
      errors.push('Role is required');
    }

    if (this.id?.hasError('required')) {
      errors.push(`${this.getFieldLabel()} is required`);
    } else if (this.id?.hasError('minlength')) {
      errors.push(`${this.getFieldLabel()} must be at least 3 characters`);
    } else if (this.id?.hasError('maxlength')) {
      errors.push(`${this.getFieldLabel()} must be less than 50 characters`);
    }

    if (this.username?.hasError('required')) {
      errors.push('Username is required');
    } else if (this.username?.hasError('minlength')) {
      errors.push('Username must be at least 2 characters');
    } else if (this.username?.hasError('maxlength')) {
      errors.push('Username must be less than 50 characters');
    } else if (this.username?.hasError('pattern')) {
      errors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }

    if (this.password?.hasError('required')) {
      errors.push('Password is required');
    } else if (this.password?.hasError('minlength')) {
      errors.push('Password must be at least 8 characters');
    } else if (this.password?.hasError('maxlength')) {
      errors.push('Password must be less than 100 characters');
    }

    if (errors.length > 0) {
      this.snackBar.open(errors.join(', '), 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  // Form control getters
  get username() {
    return this.signupForm.get('username');
  }

  get role() {
    return this.signupForm.get('role');
  }

  get id() {
    return this.signupForm.get('id');
  }

  get password() {
    return this.signupForm.get('password');
  }

  // Helper method to check if field has error
  hasFieldError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.hasError('minlength')) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const requiredLength = field.errors['maxlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${requiredLength} characters`;
    }
    if (field.hasError('pattern')) {
      return `Invalid ${fieldName} format`;
    }

    return '';
  }
}
