import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SigninInterface } from './models/signin.model';
import { Observable } from 'rxjs';
import { SignupInterface } from './models/signup.model';
import { AccountStats } from './models/account-stats.model';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { User } from './models/user.model';
import { Store } from '@ngrx/store';
import { signinSuccess } from './store/auth.actions';
import { StudentsModel } from '../registration/models/students.model';
import { TeachersModel } from '../registration/models/teachers.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient // private router: Router,
  ) // private store: Store
  {}

  private baseUrl = `${environment.apiUrl}auth/`;

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getAuthStatus(): { isLoggedIn: boolean; user?: User; accessToken?: string } {
    const token = this.getToken();
    if (!token) {
      console.log('AuthService.getAuthStatus: No token found. Not logged in.');
      return { isLoggedIn: false };
    }

    try {
      const user: User = jwt_decode(token); // Decode the token
      const expiryTimeSeconds = user.exp; // 'exp' claim is in seconds

      if (!expiryTimeSeconds) {
        console.log(
          'AuthService.getAuthStatus: Token has no expiry. Considering invalid.'
        );
        return { isLoggedIn: false };
      }

      const expiryDate = new Date(expiryTimeSeconds * 1000); // Convert seconds to milliseconds
      if (expiryDate >= new Date()) {
        console.log('AuthService.getAuthStatus: Token found and is valid.');
        return { isLoggedIn: true, user: user, accessToken: token };
      } else {
        console.log('AuthService.getAuthStatus: Token found but expired.');
        return { isLoggedIn: false };
      }
    } catch (error) {
      console.error(
        'AuthService.getAuthStatus: Error decoding token, considering invalid:',
        error
      );
      return { isLoggedIn: false }; // Error decoding, consider token invalid/expired
    }
  }

  // isTokenExpired(): boolean {
  //   const token = this.getToken();
  //   let user: User;
  //   if (!token) {
  //     console.log('no token found');
  //     return true; // Token not found, consider it expired
  //   }
  //   try {
  //     user = jwt_decode(token);
  //     const expiryTimeSeconds = user.exp; // 'exp' claim is in seconds

  //     if (!expiryTimeSeconds) {
  //       return true; // No expiry claim, consider expired (or handle as needed)
  //     }

  //     const expiryDate = new Date(expiryTimeSeconds * 1000); // Convert seconds to milliseconds
  //     if (expiryDate >= new Date()) {
  //       const payload = {
  //         user,
  //         accessToken: token,
  //       };
  //       this.store.dispatch(signinSuccess(payload));
  //       // console.log('dispatched signin success');
  //       return false;
  //     }
  //     return true;
  //     // return expiryDate <= new Date(); // Check if expiry date is in the past
  //   } catch (error) {
  //     // console.error('Error decoding token:', error);
  //     return true; // Error decoding, consider token invalid/expired
  //   }
  // }

  // checkTokenAndNavigate(): void {
  //   // console.log('here lies one whose name was writ in water');
  //   if (this.isTokenExpired()) {
  //     console.log('token expired navigating to signnin');
  //     this.router.navigate(['/signin']);
  //   } else {
  //     console.log('token ok. navigating to dashboard');
  //     this.router.navigateByUrl('/dashboard');
  //   }
  // }

  signin(signinData: SigninInterface): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(
      this.baseUrl + 'signin',

      signinData
    );
  }

  signup(signupData: SignupInterface): Observable<{ response: boolean }> {
    // console.log(signupData);
    return this.http.post<{ response: boolean }>(
      this.baseUrl + 'signup',
      signupData
    );
  }

  getAccountsStats(): Observable<AccountStats> {
    return this.http.get<AccountStats>(this.baseUrl);
  }

  fetchUserDetails(id: string): Observable<StudentsModel | TeachersModel> {
    return this.http.get<StudentsModel | TeachersModel>(this.baseUrl + id);
  }
}
