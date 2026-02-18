import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

function getTenantSlug(): string {
  if (typeof window === 'undefined') return 'default';
  // Fixed tenant per deployment: one codebase, one deployment per school — no selector
  if (environment.tenantSlug) return environment.tenantSlug;
  const stored = localStorage.getItem('tenantSlug');
  if (stored) return stored;
  const hostname = (window.location.hostname || '').toLowerCase();
  const defaultHosts = environment.defaultTenantHosts ?? [];
  if (defaultHosts.some((h) => h.toLowerCase() === hostname)) return 'default';
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const sub = parts[0];
    if (sub && sub !== 'www' && sub !== 'api') return sub;
  }
  return 'default';
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tenantSlug = getTenantSlug();
    let reqWithTenant = req.clone({
      headers: req.headers.set('X-Tenant', tenantSlug),
    });

    const idToken = localStorage.getItem('token');

    if (idToken) {
      // Check if token is expired before sending
      try {
        const decoded: any = JSON.parse(atob(idToken.split('.')[1]));
        const expiryTime = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        
        if (expiryTime < now) {
          console.warn('Token expired, removing from localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('jhs_session');
          localStorage.removeItem('tenantSlug');
          // Redirect to login if we're not already there
          if (typeof window !== 'undefined' && !reqWithTenant.url.includes('/signin')) {
            window.location.href = '/signin';
          }
          // Don't send expired token
          return next.handle(reqWithTenant);
        }
      } catch (e) {
        // If we can't decode, still try to send it (let backend validate)
        console.warn('Could not decode token for expiration check');
      }
      
      const cloned = reqWithTenant.clone({
        headers: reqWithTenant.headers.set('Authorization', 'Bearer ' + idToken),
      });

      return next.handle(cloned);
    } else {
      return next.handle(reqWithTenant);
    }
  }
}
