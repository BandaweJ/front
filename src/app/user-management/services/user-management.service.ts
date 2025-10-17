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
  ): Observable<UserListPaginatedModel> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (role) {
      params = params.set('role', role);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.httpClient.get<UserListPaginatedModel>(`${this.baseUrl}`, { params });
  }

  getUserById(id: string): Observable<UserDetailsModel> {
    return this.httpClient.get<UserDetailsModel>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: string, user: UpdateUserModel): Observable<UserDetailsModel> {
    return this.httpClient.put<UserDetailsModel>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.httpClient.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  changePassword(id: string, passwordData: ChangePasswordModel): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(`${this.baseUrl}/${id}/change-password`, passwordData);
  }

  resetPassword(id: string): Observable<{ message: string; temporaryPassword: string }> {
    return this.httpClient.post<{ message: string; temporaryPassword: string }>(`${this.baseUrl}/${id}/reset-password`, {});
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
