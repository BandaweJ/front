export interface UserManagementModel {
  id: string;
  username: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
  createdBy: string;
  profileId: string;
}

export interface UserDetailsModel extends UserManagementModel {
  profile: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    studentNumber?: string;
    employeeId?: string;
  };
  activityCount: number;
  sessionCount: number;
}

export interface UserListPaginatedModel {
  users: UserManagementModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserModel {
  username: string;
  password: string;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  profileId: string;
}

export interface UpdateUserModel {
  username?: string;
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ChangePasswordModel {
  currentPassword: string;
  newPassword: string;
}

export interface UserActivityModel {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
}

export interface UserActivityPaginatedModel {
  activities: UserActivityModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


