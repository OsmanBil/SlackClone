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
      })
    })
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
      })
  }

checkShownInSidebar(){




}

  //   async aaaadsf(){
  //     querySnapshot2.forEach( async (doc2: any) => {
  //       if (doc2.data().id == this.localUser['uid']) {
  //         currentChatroom.shownInSidebar = doc2.data().shownInSidebar;
  //       }
  //       else {
  //         currentChatroom.id = doc2.data().id;
  //       }
  //       const userQ = query(collection(this.db, 'users'), where(doc2.data().id, "==", "uid"));
  //       const userSnapQ = await getDocs(userQ);
  //       querySnapshot.forEach((doc3: any) => {
  //         this.bla = doc3.id;
  //         currentChatroom.photoURL = doc3.data().photoURL;
  //         console.log(this.bla)
  //       });
  //     });
  //     console.log(this.bla)
  //     this.chatrooms.push({ name: this.bla, photoURL: currentChatroom.photoURL, id: doc.id })
  //   })
  //   console.log(this.chatrooms)


  //   this.firestore
  //     .collection('channels')
  //     .valueChanges({ idField: 'channelId' })
  //     .subscribe((changes: any) => {
  //       this.channels = changes;
  //     })
  //   }

  // }

  openChatroom(chatroomID) {
    console.log(chatroomID)
    this.router.navigateByUrl('/mainpage/chatroom/' + chatroomID);
  }
}
