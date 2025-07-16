import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectUser,
  selectUserDetails,
  isLoading,
  selectErrorMsg,
} from '../store/auth.selectors';
import { userDetailsActions } from '../store/auth.actions';
import { filter, take } from 'rxjs/operators'; // Import withLatestFrom
import { User } from '../models/user.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';
import { ParentsModel } from 'src/app/registration/models/parents.model';
import { Observable } from 'rxjs';
import { ROLES } from 'src/app/registration/models/roles.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null> = this.store.select(selectUser);
  userDetails$: Observable<
    TeachersModel | StudentsModel | ParentsModel | null
  > = this.store.select(selectUserDetails);
  isLoading$: Observable<boolean> = this.store.select(isLoading);
  errorMsg$: Observable<string> = this.store.select(selectErrorMsg);
  teacher!: TeachersModel;
  student!: StudentsModel;
  parent!: ParentsModel;

  // Store the user's role from the JWT payload for convenience in template
  currentUserRole: ROLES | null = null;

  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {
    // Subscribe to user$ to get the role and dispatch the fetch action
    this.user$
      .pipe(
        filter((user): user is User => user !== null), // Only proceed if user is not null
        take(1) // Take only the first emission where user is not null
      )
      .subscribe((user) => {
        this.currentUserRole = user.role; // Store the role
        const id = user.id;
        console.log('Dispatching fetch user details for ID:', id);
        this.store.dispatch(userDetailsActions.fetchUser({ id }));
      });

    this.userDetails$.subscribe((details) => {
      if (this.currentUserRole === ROLES.teacher) {
        this.teacher = details as TeachersModel;
      } else if (this.currentUserRole === ROLES.student) {
        this.student = details as StudentsModel;
      } else if (this.currentUserRole === ROLES.parent) {
        this.parent = details as ParentsModel;
      }
    });
  }

  // Helper function to check if the current user is a teacher
  // Now relies on currentUserRole, which comes from the User (JWT payload)
  isTeacher(): boolean {
    return this.currentUserRole === ROLES.teacher;
  }

  // Helper function to check if the current user is a student
  // Now relies on currentUserRole
  isStudent(): boolean {
    return this.currentUserRole === ROLES.student;
  }

  // Helper function to check if the current user is a parent
  // Now relies on currentUserRole
  isParent(): boolean {
    return this.currentUserRole === ROLES.parent;
  }
}
