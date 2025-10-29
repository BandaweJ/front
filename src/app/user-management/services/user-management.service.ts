/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserManagementModel, UserDetailsModel, UserListPaginatedModel, CreateUserModel, UpdateUserModel, ChangePasswordModel, UserActivityPaginatedModel } from '../models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = environment.apiUrl + '/user-management';

  constructor(private httpClient: HttpClient) {}

  createUser(user: CreateUserModel): Observable<UserDetailsModel> {
    return this.httpClient.post<UserDetailsModel>(`${this.baseUrl}`, user);
  }

  getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    status?: string
  ): Observable<any[]> {
    // Use the new backend endpoint
    return this.httpClient.get<any[]>(`${environment.apiUrl}/auth/accounts/all`);
  }

  getUserById(id: string, role: string): Observable<UserDetailsModel> {
    // Use the existing auth endpoint
    return this.httpClient.get<UserDetailsModel>(`${environment.apiUrl}/auth/${id}/${role}`);
  }

  updateUser(id: string, user: UpdateUserModel): Observable<{ message: string }> {
    // Update account (username)
    return this.httpClient.patch<{ message: string }>(`${environment.apiUrl}/auth/${id}`, { username: user.username });
  }

  updateProfile(id: string, profileData: any): Observable<{ message: string }> {
    // Update profile (name, surname, email, cell, address)
    return this.httpClient.patch<{ message: string }>(`${environment.apiUrl}/auth/${id}/profile`, profileData);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    // TODO: Implement account deletion in backend
    return this.httpClient.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  changePassword(id: string, passwordData: ChangePasswordModel): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(`${this.baseUrl}/${id}/change-password`, passwordData);
  }

  resetPassword(id: string): Observable<{ message: string; temporaryPassword: string }> {
    return this.httpClient.post<{ message: string; temporaryPassword: string }>(`${environment.apiUrl}/auth/${id}/reset-password`, {});
  }

  getUserActivity(id: string, page: number = 1, limit: number = 20): Observable<UserActivityPaginatedModel> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<UserActivityPaginatedModel>(`${this.baseUrl}/${id}/activity`, { params });
  }

  getSystemActivity(page: number = 1, limit: number = 20): Observable<UserActivityPaginatedModel> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<UserActivityPaginatedModel>(`${this.baseUrl}/activity/system`, { params });
  }
}


