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
import { ActivatedRoute } from '@angular/router';


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

  chatIDs = [];
  chatUserIDs = [];

  constructor(public dialog: MatDialog, private firestore: AngularFirestore, private router: Router, private route: ActivatedRoute) { }


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
    // LOAD USER FROM CHATROOM
    let docRef = collection(this.db, "users", this.localUser['uid'], "chatids");
    const unsubscribe = onSnapshot(docRef, async (querySnapshot) => {
      this.chatIDs = [];
      querySnapshot.forEach(async (doc) => {
        this.chatIDs.push(doc.id)
      })
      await this.loadChatIDs();
      await this.loadChatroomUserData();
      
    })
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
      })
  }

  async loadChatIDs() {
    this.chatUserIDs = [];
    for (let x = 0; x < this.chatIDs.length; x++) {
      let docRef2 = collection(this.db, "chatrooms", this.chatIDs[x], "users");
      let querySnapshot2 = await getDocs(docRef2);
      querySnapshot2.forEach(async (doc2: any) => {
        if (doc2.data().id !== this.localUser['uid']) {
          this.chatUserIDs.push({ userID: doc2.data().id, name: doc2.data().name, chatID: this.chatIDs[x] })
        }
      })
    }
  };

  async loadChatroomUserData(){
    this.chatrooms = [];
      for (let i = 0; i < this.chatUserIDs.length; i++) {
        const unsub = onSnapshot(doc(this.db, "users", this.chatUserIDs[i].userID), { includeMetadataChanges: true },
          (doc: any) => {
            let chatrommUser = {
              userID: doc.data().id, chatroomID: this.chatUserIDs[i].chatID, name: doc.data().displayName,
              isOnline: doc.data().isOnline, photoURL: doc.data().photoURL, localIndex: i+1
            }
            if (this.chatrooms[chatrommUser.localIndex]) {
              this.chatrooms[chatrommUser.localIndex] = chatrommUser
            }
            if (this.chatrooms.length < this.chatUserIDs.length) {
              this.chatrooms.push(chatrommUser)
          }
          })
      }
  }

 

  openChatroom(chatroomID) {
    this.router.navigateByUrl('/mainpage/chatroom/' + chatroomID);

    
  }
}
