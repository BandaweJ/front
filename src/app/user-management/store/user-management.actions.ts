/* eslint-disable prettier/prettier */
import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { UserManagementModel, UserDetailsModel, UserListPaginatedModel, CreateUserModel, UpdateUserModel, ChangePasswordModel, UserActivityPaginatedModel } from '../models/user-management.model';

export const userManagementActions = createActionGroup({
  source: 'User Management',
  events: {
    // Load Users
    loadUsers: props<{ page?: number; limit?: number; search?: string; role?: string; status?: string }>(),
    loadUsersSuccess: props<{ users: UserListPaginatedModel }>(),
    loadUsersFailure: props<{ error: string }>(),

    // Load User Details
    loadUserDetails: props<{ id: string }>(),
    loadUserDetailsSuccess: props<{ user: UserDetailsModel }>(),
    loadUserDetailsFailure: props<{ error: string }>(),

    // Create User
    createUser: props<{ user: CreateUserModel }>(),
    createUserSuccess: props<{ user: UserDetailsModel }>(),
    createUserFailure: props<{ error: string }>(),

    // Update User
    updateUser: props<{ id: string; user: UpdateUserModel }>(),
    updateUserSuccess: props<{ user: UserDetailsModel }>(),
    updateUserFailure: props<{ error: string }>(),

    // Delete User
    deleteUser: props<{ id: string }>(),
    deleteUserSuccess: props<{ id: string }>(),
    deleteUserFailure: props<{ error: string }>(),

    // Change Password
    changePassword: props<{ id: string; passwordData: ChangePasswordModel }>(),
    changePasswordSuccess: props<{ message: string }>(),
    changePasswordFailure: props<{ error: string }>(),

    // Reset Password
    resetPassword: props<{ id: string }>(),
    resetPasswordSuccess: props<{ message: string; temporaryPassword: string }>(),
    resetPasswordFailure: props<{ error: string }>(),

    // Load User Activity
    loadUserActivity: props<{ id: string; page?: number; limit?: number }>(),
    loadUserActivitySuccess: props<{ activity: UserActivityPaginatedModel }>(),
    loadUserActivityFailure: props<{ error: string }>(),

    // Load System Activity
    loadSystemActivity: props<{ page?: number; limit?: number }>(),
    loadSystemActivitySuccess: props<{ activity: UserActivityPaginatedModel }>(),
    loadSystemActivityFailure: props<{ error: string }>(),

    // Clear State
    clearUsers: emptyProps(),
    clearUserDetails: emptyProps(),
    clearActivity: emptyProps(),
  }
});


