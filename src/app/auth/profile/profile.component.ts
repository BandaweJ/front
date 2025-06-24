import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { selectUser, selectUserDetails } from '../store/auth.selectors';
import { fetchUserDetailsActions } from '../store/auth.actions';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user$ = this.store.select(selectUser);
  id!: string;
  userDetails$ = this.store.select(selectUserDetails);

  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.user$.subscribe((usr) => {
      this.id = usr?.id || '';
    });

    if (this.id) {
      const id = this.id;
      console.log('id', id);
      this.store.dispatch(fetchUserDetailsActions.fetchUser({ id }));
    }
  }
}
