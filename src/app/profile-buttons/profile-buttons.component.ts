// src/app/profile-buttons/profile-buttons.component.ts
import { Component, Input } from '@angular/core'; // Removed EventEmitter, Output as not used
import { Store } from '@ngrx/store';
import { logout } from '../auth/store/auth.actions'; // Adjusted path: assuming auth.actions is sibling to auth.reducer/state
import { Router } from '@angular/router';
// REMOVED: MatMenuModule import here. It belongs in app.module.ts or a shared Material module.

@Component({
  selector: 'app-profile-buttons',
  templateUrl: './profile-buttons.component.html', // Points to the external HTML file
  styleUrls: ['./profile-buttons.component.css'],
})
export class ProfileButtonsComponent {
  // Input: isLoggedIn status from the parent component (app.component)
  @Input()
  isLoggedIn!: boolean | null;

  constructor(private store: Store, private router: Router) {} // Type the Store

  onLogout(): void {
    this.store.dispatch(logout());
  }

  onProfile(): void {
    this.router.navigateByUrl('/profile');
  }

  switchToSignin(): void {
    this.router.navigateByUrl('/signin');
  }
}
