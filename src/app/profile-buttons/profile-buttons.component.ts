import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { logout } from '../auth/store/auth.actions';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-profile-buttons',
  templateUrl: './profile-buttons.component.html',
  styleUrls: ['./profile-buttons.component.css'],
})
export class ProfileButtonsComponent {
  constructor(private store: Store, private router: Router) {}

  @Input()
  isLoggedIn!: boolean | null;

  onLogout() {
    this.store.dispatch(logout());
    localStorage.removeItem('token');
    this.router.navigateByUrl('/signin');
  }

  switchToSignin() {
    this.router.navigateByUrl('/signin');
  }
}
