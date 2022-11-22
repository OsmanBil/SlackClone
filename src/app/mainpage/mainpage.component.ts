import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditUserComponent } from '../dialog-edit-user/dialog-edit-user.component';
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
  currentUser: User;

 
  constructor(public authService: AuthService, private firestore: AngularFirestore, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getCurrentUser();
  }


  getCurrentUser(){
    this.firestore
      .collection('users')
      .valueChanges({ idField: 'userId' })
      .subscribe((users: any) => {
        this.users = users;
        this.getCurrentUserId();
      })
     
  }


  getCurrentUserId() {
    let currentUser = localStorage.getItem('user');
    currentUser = JSON.parse(currentUser);
    if (currentUser == null) {
      // nothing happen
    } else {
      this.currentUserId = currentUser['uid'];
    }

    this.setCurrentUser();
  }


  setCurrentUser() {
    let currentUser = this.users.filter((user: any) => user['uid'] == this.currentUserId);
    this.currentUser = currentUser[0];
  }


  openSettings() {
    let dialog = this.dialog.open(DialogEditUserComponent);
    dialog.componentInstance.user = this.currentUser;
    dialog.componentInstance.userId = this.currentUserId;
  }

  
}
