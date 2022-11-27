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

  chatIDs = [];
  chatUserIDs = [];

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
    // LOAD USER FROM CHATROOM
    let docRef = collection(this.db, "users", this.localUser['uid'], "chatids");

    // let querySnapshot = await getDocs(docRef);
    const unsubscribe = onSnapshot(docRef, async (querySnapshot) => {
      this.chatIDs = [];
      querySnapshot.forEach(async (doc) => {
        // let docRef2 = collection(this.db, "chatrooms", doc.id, "users");
        // let querySnapshot2 = await getDocs(docRef2);
        this.chatIDs.push(doc.id)
        console.log(this.chatIDs)
      })
      this.chatUserIDs = [];
      for (let x = 0; x < this.chatIDs.length; x++) {
        let docRef2 = collection(this.db, "chatrooms", this.chatIDs[x], "users");
        let querySnapshot2 = await getDocs(docRef2);
        querySnapshot2.forEach(async (doc2: any) => {
          if (doc2.data().id !== this.localUser['uid']) {
            // currentChatroom.id = doc2.data().id;
            // this.chatrooms.push({ name: doc2.data().name, photoURL: doc2.data().photoURL, id: doc.id, shownInSidebar: '' })
            this.chatUserIDs.push({ userID: doc2.data().id, name: doc2.data().name, chatID: this.chatIDs[x] })
            console.log(this.chatUserIDs)
          }
        })

      }

      this.chatrooms = [];
      for(let i = 0; i < this.chatUserIDs.length; i++){
        const unsub = onSnapshot(doc(this.db, "users", this.chatUserIDs[i].userID), {includeMetadataChanges: true}, 
        (doc: any) => {
           let chatrommUser = { userID: doc.data().id, chatroomID: this.chatUserIDs[i].chatID,  name: doc.data().displayName,
             isOnline: doc.data().isOnline, photoURL: doc.data().photoURL}
           this.chatrooms.push(chatrommUser)
            console.log(doc.data().chatID)
        })
      }



      // this.chatrooms = [];
      // const unsubscribe2 = onSnapshot(docRef2, (querySnapshot2) => {
      // querySnapshot2.forEach(async (doc2: any) => {
      //   if (doc2.data().id !== this.localUser['uid']) {
      //     // currentChatroom.id = doc2.data().id;
      //     // this.chatrooms.push({ name: doc2.data().name, photoURL: doc2.data().photoURL, id: doc.id, shownInSidebar: '' })
      //     this.chatrooms.push({ userID: doc2.data().id, chatroomID: doc.id,  name: doc2.data().name,})
      //   }

      // })
      // })


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
      //})
    })
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
      })
    console.log(this.chatrooms)
  }

  openChatroom(chatroomID) {
    this.router.navigateByUrl('/mainpage/chatroom/' + chatroomID);
  }
}
