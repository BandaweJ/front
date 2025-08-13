import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SignupInterface } from '../models/signup.model';
import { resetErrorMessage, signupActions } from '../store/auth.actions'; // Import grouped action
import { Observable } from 'rxjs';
import { isLoading, selectErrorMsg } from '../store/auth.selectors';
import { ROLES } from 'src/app/registration/models/roles.enum';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.errorMsg$ = this.store.select(selectErrorMsg);
    this.isLoading$ = this.store.select(isLoading);

    this.store.dispatch(resetErrorMessage());

    this.signupForm = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        // Add more specific validators based on role here if needed
      ]),
      role: new FormControl('', Validators.required),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  signupForm!: FormGroup;
  hide = true;
  roles = [...Object.values(ROLES)];
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;

  signup() {
    const signupData: SignupInterface = this.signupForm.value;
    this.store.dispatch(signupActions.signup({ signupData })); // Use grouped action
  }

  switchToSignIn() {
    this.router.navigateByUrl('/signin');
  }

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
}
