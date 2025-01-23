import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsLoggedIn, selectUser } from './auth/store/auth.selectors';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { signinFailure, signinSuccess } from './auth/store/auth.actions';
import { User } from './auth/models/user.model';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private store: Store, private router: Router) {}

  role = '';
  isLoggedIn$!: Observable<boolean>;
  showProfile = false;

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    // const decoded = jwtDecode(token);
    if (this.isEmptyToken(token) || this.isTokenExpired(token)) {
      this.router.navigateByUrl('/signin');
    } else {
      if (token) {
        const user: User = jwt_decode(token);
        this.role = user.role;

        const payload = {
          accessToken: token,
          user,
        };

        this.store.dispatch(signinSuccess(payload));
      }
    }

    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }

  isEmptyToken(token: string | null): boolean {
    return !!token;
  }

  isTokenExpired(token: string | null): boolean {
    if (token) {
      const user: User = jwt_decode(token);
      const expAt = new Date(user.exp);
      const now = new Date();
      return now > expAt;
    }
    return false;
  }

  login() {
    this.router.navigateByUrl('/signin');
  }

  // navigateToTeachers() {
  //   this.router.navigateByUrl('/taechers');
  // }
}
