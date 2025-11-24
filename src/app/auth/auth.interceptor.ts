import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
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
          // Redirect to login if we're not already there
          if (typeof window !== 'undefined' && !req.url.includes('/signin')) {
            window.location.href = '/signin';
          }
          // Don't send expired token
          return next.handle(req);
        }
      } catch (e) {
        // If we can't decode, still try to send it (let backend validate)
        console.warn('Could not decode token for expiration check');
      }
      
      const cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + idToken),
      });

      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
