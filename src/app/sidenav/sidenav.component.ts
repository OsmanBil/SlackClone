import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { user } from '@angular/fire/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})


export class SidenavComponent implements OnInit {

  channels = [];

  channelOpen = true;
  messageOpen = false;

  db = getFirestore();
  chatrooms = [];
  localUser;

  bla = '';

  constructor(public dialog: MatDialog, private firestore: AngularFirestore, private router: Router) { }


  ngOnInit(): void {


    this.loadChatrooms();

  }



  openDialogCreateChannel() {
    this.dialog.open(DialogCreateChannelComponent);
  }


  toggleChannelMenu() {
    if (this.channelOpen) {
      this.channelOpen = false;
    }
    else {
      this.channelOpen = true;
    }
  }


  toggleMessageMenu() {
    if (this.messageOpen) {
      this.messageOpen = false;
    }
    else {
      this.messageOpen = true;
    }
  }

  async loadChatrooms() {
    this.localUser = JSON.parse(localStorage.getItem('user'))
    // load chatrooms from user
    let docRef = collection(this.db, "users", this.localUser['uid'], "chatids");
    let querySnapshot = await getDocs(docRef);
    let currentChatroom = { id: '', name: '', shownInSidebar: true, photoURL: '' }
    this.channels = [];
    querySnapshot.forEach(async (doc) => {
      let docRef2 = collection(this.db, "chatrooms", doc.id, "users");
      let querySnapshot2 = await getDocs(docRef2);



      querySnapshot2.forEach(async (doc2: any) => {
        if (doc2.data().id !== this.localUser['uid']) {
          currentChatroom.id = doc2.data().id;
          this.chatrooms.push({ name: doc2.data().name, photoURL: doc2.data().photoURL, id: doc.id, shownInSidebar: '' })
        }


      // querySnapshot2.forEach((doc2: any) => {
      //   if (doc2.data().name == this.localUser['displayName']) {
      //     currentChatroom.shownInSidebar = doc2.data().shownInSidebar;
      //   }
      //   else {
      //     currentChatroom.name = doc2.data().name;
      //     currentChatroom.photoURL = doc2.data().photoURL;
      //     currentChatroom.id = doc.id;
      //     this.chatrooms.push({ name: currentChatroom.name, photoURL: currentChatroom.photoURL, id: doc.id })
      //   }
     })
    })
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
      })
  }

  openChatroom(chatroomID){
    this.router.navigateByUrl('/mainpage/chatroom/' + chatroomID);
  }
}
