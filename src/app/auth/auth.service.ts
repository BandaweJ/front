import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SigninInterface } from './models/signin.model';
import { Observable } from 'rxjs';
import { SignupInterface } from './models/signup.model';
import { AccountStats } from './models/account-stats.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private baseUrl = `${environment.apiUrl}auth/`;

  signin(signinData: SigninInterface): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(
      this.baseUrl + 'signin',

      signinData
    );
  }

  signup(signupData: SignupInterface): Observable<{ response: boolean }> {
    console.log(signupData);
    return this.http.post<{ response: boolean }>(
      this.baseUrl + 'signup',
      signupData
    );
  }

  getAccountsStats(): Observable<AccountStats> {
    return this.http.get<AccountStats>(this.baseUrl);
  }
}
