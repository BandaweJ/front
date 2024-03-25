import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsLoggedIn, selectUser } from './auth/store/auth.selectors';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { signinSuccess } from './auth/store/auth.actions';
import { User } from './auth/models/user.model';
import { fetchTeachers } from './registration/store/registration.actions';
import { selectTeachers } from './registration/store/registration.selectors';
import { ROLES } from './registration/models/roles.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private store: Store, private router: Router) {}

  role = '';

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const user: User = jwt_decode(token);

      this.role = user.role;

      const payload = {
        accessToken: token,
        user,
      };
      // console.log(user);
      if (user.exp) {
        const expAt = new Date(user.exp);

        this.store.dispatch(signinSuccess(payload));
      }
    }
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }

  isLoggedIn$!: Observable<boolean>;
  showProfile = false;

  login() {
    this.router.navigateByUrl('/signin');
  }

  navigateToTeachers() {
    this.router.navigateByUrl('/taechers');
  }
}
