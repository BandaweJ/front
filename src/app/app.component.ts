import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MediaMatcher } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectUser } from './auth/store/auth.selectors';
import { checkAuthStatus } from './auth/store/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'My App';

  @ViewChild('sidenav') sidenav!: MatSidenav;

  isSidenavCollapsed: boolean = true; // Initial state: collapsed on large screens
  isScreenSmall: boolean = false;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  user$ = this.store.select(selectUser);
  role!: string;
  isLoggedIn$: Observable<boolean>; // Simulate logged-in state, typically from an auth service
  isLoggedInStatus!: boolean; // Store the actual boolean status for TS logic

  private destroy$ = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private store: Store
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 767px)');
    this._mobileQueryListener = () => {
      this.changeDetectorRef.detectChanges();
      this.checkScreenSize();
    };
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }

  ngOnInit(): void {
    this.store.dispatch(checkAuthStatus());

    this.checkScreenSize(); // Initial screen size check

    // Subscribe to isLoggedIn$ to update isLoggedInStatus
    this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((loggedIn) => {
      this.isLoggedInStatus = loggedIn;
      // Re-evaluate sidenav state and margin when login status changes
      this.checkScreenSize(); // This will ensure sidenav opens/closes based on isLoggedInStatus
      this.changeDetectorRef.detectChanges(); // Force update view to reflect margin change
    });

    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  checkScreenSize() {
    this.isScreenSmall = this.mobileQuery.matches;

    if (this.isScreenSmall) {
      // On small screens, ensure sidenav is closed (over mode)
      this.sidenav?.close();
      this.isSidenavCollapsed = false; // Collapsed state is irrelevant for width on overlay mode
    } else {
      // On large screens, manage sidenav open/close based on login status
      if (this.isLoggedInStatus) {
        // Only open if logged in
        this.sidenav?.open();
      } else {
        this.sidenav?.close(); // Explicitly close if not logged in on large screen
      }
      this.isSidenavCollapsed = true; // Ensure it starts collapsed on large screens
    }
  }

  onSidenavOpenedChange(isOpen: boolean) {
    if (!this.isScreenSmall) {
      // Only manage isSidenavCollapsed on large screens (for side mode)
      this.isSidenavCollapsed = !isOpen;
    }
  }
}
