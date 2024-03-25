import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { signin } from '../store/auth.actions';
import { SigninInterface } from '../models/signin.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import * as fromAuthSelectors from '../store/auth.selectors';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  constructor(
    private store: Store,
    private router: Router,
    private title: Title
  ) {}

  signinForm!: FormGroup;
  hide = true;
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;

  ngOnInit(): void {
    this.errorMsg$ = this.store.select(fromAuthSelectors.selectErrorMsg);
    this.isLoading$ = this.store.select(fromAuthSelectors.isLoading);
    // this.store.dispatch(resetErrorMessage());

    this.signinForm = new FormGroup({
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

  get username() {
    return this.signinForm.get('username');
  }

  get password() {
    return this.signinForm.get('password');
  }

  signin() {
    const signinData: SigninInterface = this.signinForm.value;
    this.store.dispatch(signin({ signinData }));
    // console.log(this.signinForm.value);
  }

  switchToSignUp() {
    this.router.navigateByUrl('/signup');
  }
}
