/* eslint-disable prettier/prettier */
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ROLES } from '../../../registration/models/roles.enum';
import { UserManagementModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectUsersList, selectLoading, selectError, selectUsersPagination } from '../../store/user-management.selectors';
import { CreateUserDialogComponent } from '../create-user/create-user-dialog.component';
import { UserDetailsDialogComponent } from '../user-details/user-details-dialog.component';
import { UserActivityComponent } from '../user-activity/user-activity.component';
import { BulkOperationsComponent, BulkOperationData } from '../bulk-operations/bulk-operations.component';
import { SystemActivityComponent } from '../system-activity/system-activity.component';
import { ConfirmDeleteDialogComponent } from '../../../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  // Data
  dataSource = new MatTableDataSource<UserManagementModel>([]);
  displayedColumns: string[] = ['select', 'username', 'name', 'role', 'status', 'createdAt', 'actions'];

  // Filters
  searchControl = new FormControl('');
  roleControl = new FormControl('');
  statusControl = new FormControl('');

  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;

  // Loading and error states
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  // Roles for filter dropdown
  roles = Object.values(ROLES);
  statuses = ['active', 'inactive', 'suspended'];

  // Selection
  selectedUsers: UserManagementModel[] = [];
  isAllSelected = false;
  isIndeterminate = false;

  constructor(
    private store: Store,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadUsers();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadUsers();
      });

    this.roleControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadUsers();
      });

    this.statusControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadUsers();
      });
  }

  private setupSubscriptions(): void {
    this.store.select(selectUsersList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.dataSource.data = users;
      });

    this.store.select(selectUsersPagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pagination => {
        if (pagination) {
          this.totalItems = pagination.total;
        }
      });
  }

  private loadUsers(): void {
    const search = this.searchControl.value || undefined;
    const role = this.roleControl.value || undefined;
    const status = this.statusControl.value || undefined;

    this.store.dispatch(userManagementActions.loadUsers({
      page: this.currentPage + 1,
      limit: this.pageSize,
      search,
      role,
      status
    }));
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(event: any): void {
    // Implement sorting if needed
    this.loadUsers();
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Refresh the list
      }
    });
  }

  openUserDetailsDialog(user: UserManagementModel): void {
    this.dialog.open(UserDetailsDialogComponent, {
      width: '800px',
      data: { userId: user.id }
    });
  }

  openEditUserDialog(user: UserManagementModel): void {
    // TODO: Implement edit user dialog
    console.log('Edit user:', user);
  }

  openDeleteUserDialog(user: UserManagementModel): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user.id);
      }
    });
  }

  private deleteUser(userId: string): void {
    this.store.dispatch(userManagementActions.deleteUser({ id: userId }));
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.roleControl.setValue('');
    this.statusControl.setValue('');
    this.currentPage = 0;
    this.loadUsers();
  }

  getRoleDisplayName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'warn';
      case 'suspended':
        return 'accent';
      default:
        return 'primary';
    }
  }

  // Selection Methods
  isSelected(user: UserManagementModel): boolean {
    return this.selectedUsers.some(selected => selected.id === user.id);
  }

  toggleSelection(user: UserManagementModel): void {
    const index = this.selectedUsers.findIndex(selected => selected.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
    this.updateSelectionState();
  }

  toggleAllSelection(): void {
    if (this.isAllSelected) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.dataSource.data];
    }
    this.updateSelectionState();
  }

  private updateSelectionState(): void {
    const numSelected = this.selectedUsers.length;
    const numRows = this.dataSource.data.length;
    this.isAllSelected = numSelected === numRows;
    this.isIndeterminate = numSelected > 0 && numSelected < numRows;
  }

  // Advanced Actions
  openUserActivityDialog(user: UserManagementModel): void {
    this.dialog.open(UserActivityComponent, {
      width: '1000px',
      maxHeight: '90vh',
      data: { 
        userId: user.id, 
        userName: user.username 
      }
    });
  }

  openBulkOperationsDialog(operation: string): void {
    if (this.selectedUsers.length === 0) {
      // Show error message
      return;
    }

    const dialogRef = this.dialog.open(BulkOperationsComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { 
        selectedUsers: this.selectedUsers,
        operation: operation
      } as BulkOperationData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedUsers = [];
        this.updateSelectionState();
        this.loadUsers(); // Refresh the list
      }
    });
  }

  openSystemActivityDialog(): void {
    this.dialog.open(SystemActivityComponent, {
      width: '100%',
      maxWidth: '1400px',
      maxHeight: '90vh',
      data: {}
    });
  }

  // Bulk Action Methods
  onBulkDelete(): void {
    this.openBulkOperationsDialog('delete');
  }

  onBulkUpdateRole(): void {
    this.openBulkOperationsDialog('update_role');
  }

  onBulkUpdateStatus(): void {
    this.openBulkOperationsDialog('update_status');
  }

  onBulkResetPassword(): void {
    this.openBulkOperationsDialog('reset_password');
  }

  onBulkExport(): void {
    this.openBulkOperationsDialog('export');
  }

  // Utility Methods
  getSelectedUsersCount(): number {
    return this.selectedUsers.length;
  }

  canPerformBulkActions(): boolean {
    return this.selectedUsers.length > 0;
  }

  getBulkActionsText(): string {
    const count = this.selectedUsers.length;
    if (count === 0) {
      return 'No users selected';
    } else if (count === 1) {
      return '1 user selected';
    } else {
      return `${count} users selected`;
    }
  }
}
