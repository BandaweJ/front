import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { selectIsLoggedIn } from './auth/store/auth.selectors';

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
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
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
