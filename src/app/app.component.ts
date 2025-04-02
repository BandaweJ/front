import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { selectIsLoggedIn, selectUser } from './auth/store/auth.selectors';
import { ROLES } from './registration/models/roles.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private store: Store, private router: Router) {}

  role!: ROLES;
  isLoggedIn$!: Observable<boolean>;
  showProfile = false;
  user$ = this.store.select(selectUser);

  ngOnInit(): void {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.user$.subscribe((user) => {
      if (user?.role) {
        this.role = user.role;
      }
    });
  }

  // this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
}

// isEmptyToken(token: string | null): boolean {
//   return !!token;
// }

// isTokenExpired(token: string | null): boolean {
//   if (token) {
//     const user: User = jwt_decode(token);
//     const expAt = new Date(user.exp);
//     const now = new Date();
//     return now > expAt;
//   }
//   return false;
// }

// login() {
//   this.router.navigateByUrl('/signin');
// }

// navigateToTeachers() {
//   this.router.navigateByUrl('/taechers');
// }
