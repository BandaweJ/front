import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectIsLoggedIn, selectUser } from './store/auth.selectors';
import { ROLES } from '../registration/models/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    // Check if token exists and is not expired
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = decoded.exp * 1000;
        const now = Date.now();
        
        if (expiryTime < now) {
          console.warn('Token expired in AuthGuard, redirecting to signin');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('jhs_session');
          return this.router.parseUrl('/signin');
        }
      } catch (e) {
        console.warn('Could not decode token in AuthGuard');
      }
    }
    
    const allowedRoles = route.data?.['roles'] as ROLES[] | undefined;

    return combineLatest([
      this.store.select(selectIsLoggedIn),
      this.store.select(selectUser),
    ]).pipe(
      take(1),
      map(([isLoggedIn, user]) => {
        if (!isLoggedIn || !user) {
          return this.router.parseUrl('/signin');
        }

        if (!allowedRoles || allowedRoles.length === 0) {
          return true;
        }

        return allowedRoles.includes(user.role as ROLES)
          ? true
          : this.router.parseUrl('/dashboard');
      })
    );
  }
}
