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
    let docRef = collection(this.db, "users", this.localUser['uid'], "chatids");
    let querySnapshot = await getDocs(docRef);
    let currentChatroom = { id: '', name: '', shownInSidebar: true, photoURL: '' }
    this.channels = [];
    querySnapshot.forEach(async (doc) => {
      let docRef2 = collection(this.db, "chatrooms", doc.id, "users");
      let querySnapshot2 = await getDocs(docRef2);
      console.log(doc.id + 'adsfadfdfdsgasd')

      querySnapshot2.forEach((doc2: any) => {
        console.log('11111' + docRef2)
        if (doc2.data().name == this.localUser['displayName']) {
          currentChatroom.shownInSidebar = doc2.data().shownInSidebar;
        }
        else {
          currentChatroom.name = doc2.data().name;
          currentChatroom.photoURL = doc2.data().photoURL;
          currentChatroom.id = doc.id;
          this.chatrooms.push({ name: currentChatroom.name, photoURL: currentChatroom.photoURL, id: doc.id })
          console.log(doc2.data())

        }


      });

    })
    console.log('läuft')
    console.log(this.channels)
    console.log(this.localUser['uid'])
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
      })

  }

  openChatroom(chatroomID){
    console.log(chatroomID)
    this.router.navigateByUrl('/mainpage/chatroom/' + chatroomID);
  }
}
