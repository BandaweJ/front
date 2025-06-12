import { Component, OnInit, ViewChild } from '@angular/core'; // Import ViewChild
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { selectIsLoggedIn, selectUser } from './auth/store/auth.selectors';
import { ROLES } from './registration/models/roles.enum';
import { MatSidenav } from '@angular/material/sidenav'; // Import MatSidenav

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav; // Get a reference to your sidenav

  constructor(private store: Store, private router: Router) {}

  role!: ROLES;
  isLoggedIn$!: Observable<boolean>;
  showProfile = false; // Unused for now, can remove if not needed elsewhere
  user$ = this.store.select(selectUser);

  isSidenavExpanded: boolean = false; // New property to control sidenav expansion

  ngOnInit(): void {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.user$.subscribe((user) => {
      if (user?.role) {
        this.role = user.role;
      }
    });

    // Set initial sidenav state based on screen size or preference
    // For large screens, start collapsed (icons only)
    if (window.innerWidth >= 768) {
      // Or whatever your "large screen" breakpoint is
      this.isSidenavExpanded = false;
      // Also, on large screens, you might want to initially open the sidenav in 'side' mode.
      // This is handled by [opened]="true" in HTML, but you might need to call sidenav.open()
      // if you dynamically set opened to false initially.
    }
  }

  // If you still want the toggle button to work, you can define this:
  toggleSidenav() {
    this.sidenav.toggle();
    // You might want to update isSidenavExpanded if you use the toggle button,
    // depending on your desired behavior. For hover, it's automatic.
    // This could also be used to switch between 'collapsed' and 'full' manually.
    this.isSidenavExpanded = !this.isSidenavExpanded;
  }
}
