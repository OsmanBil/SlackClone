import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { User } from '../services/user';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss']
})
export class MainpageComponent implements OnInit {

  users = [];
  currentUserId = '';
  currentUser = [];

  constructor(public authService: AuthService, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.firestore
      .collection('users')
      .valueChanges({ idField: 'userId' })
      .subscribe((users: any) => {
        this.users = users;
        this.getCurrentUserId();
      })
  }


  getCurrentUserId(){
      let currentUser = localStorage.getItem('user');
      currentUser = JSON.parse(currentUser);
      this.currentUserId = currentUser['uid'];
      this.setCurrentUser();
  }


  setCurrentUser(){
    let currentUser = this.users.filter((user:any) => user['uid'] == this.currentUserId);
    this.currentUser = currentUser[0];
  }
}
