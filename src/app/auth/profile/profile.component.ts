import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Store } from '@ngrx/store';
import { selectUser } from '../store/auth.selectors';
import { fetchUserActions } from '../store/auth.actions';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent  implements OnInit{

  user$ = this.store.select(selectUser);
  id!: string;

  constructor(private router: Router, private store: Store) { }
  
  ngOnInit(): void {
    this.user$.subscribe(usr => {
      this.id = usr?.id || ''
    });

    if (this.id) {
      const id = this.id;
      this.store.dispatch(fetchUserActions.fetchUser({ id }))
    }
  }
}
