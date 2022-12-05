import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, limit, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ChatroomsService } from '../services/chatrooms.service';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})


export class SidenavComponent implements OnInit {

  channels = [];
  channelOpen = true;
  messageOpen = true;
  db = getFirestore();
  chatrooms = [];
  localUser;
  activeChatChannel = '';
  otherUserID = '';

  constructor(public dialog: MatDialog, private firestore: AngularFirestore, private router: Router, private route: ActivatedRoute,
    public chatroomService: ChatroomsService) { }


  ngOnInit(): void {
    this.loadChatroomData();
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


  // LOAD ALL CHATROOMS IN SIDEBAR FROM LOCAL USER
  loadChatroomData() {
    this.localUser = JSON.parse(localStorage.getItem('user'))
    let docRef = collection(this.db, "users", this.localUser['uid'], "chatids");
    const unsubscribe = onSnapshot(docRef, async (querySnapshot) => {
      this.chatrooms = [];
      querySnapshot.forEach(async (doc) => {
        let neededData = {
          chatroomID: '',
          showChatroomInSidebar: '',
          userID: '',
          userImg: '',
          userIsOnline: '',
          userName: '',
          newMessageforOtherUser: '',
        }
        neededData.chatroomID = doc.id;
        this.checkIfNewMessage(neededData, doc);
        this.checkIfChatroomIsShownInSidebar(neededData, doc.id);
        this.chatrooms.push(neededData);
      })
    })
    this.loadChannels();
  }

   // ÜBERPRÜFT DAUERHAFT OB NEUE NACHRICHT AN LOCAL USER GEGANGEN IST
   checkIfNewMessage(neededData, doc) {
    const x1 = query(collection(this.db, "chatrooms", doc.id, "users"), where("id", "!=", this.localUser.uid));
    const s1 = onSnapshot(x1, async (querySnapshot) => {
      querySnapshot.forEach(async (doc2: any) => {
        for (let x = 0; x < this.chatrooms.length; x++) {
          if (this.chatrooms[x].userID == doc2.uid) {
            this.chatrooms[x].newMessageforOtherUser = doc2.data().newMessage
          }
          else {
            neededData.newMessageforOtherUser = doc2.data().newMessage
          }
        }
        this.loadOtherUsers(neededData, doc2);
      })
    })
  }

   // LÄD DIE ANDEREN USERS AUßer DEN LOCAL USER
   loadOtherUsers(neededData, doc2) {
    const x2 = query(collection(this.db, "users"), where("uid", "==", doc2.id));
    const s2 = onSnapshot(x2, async (querySnapshot) => {
      querySnapshot.forEach(async (doc3: any) => {
        for (let x = 0; x < this.chatrooms.length; x++) {
          neededData.userID = doc3.data().uid
          neededData.userImg = doc3.data().photoURL;
          neededData.userName = doc3.data().displayName;
          neededData.userIsOnline = doc3.data().isOnline;
        }
      })
    })
  }

  // ÜBERPRÜFT DAUERHAFT OB DER CHATROOM IN DER SIDEBAR ANGEZEIGT WERDEN SOLL
  checkIfChatroomIsShownInSidebar(neededData, docID) {
    const x3 = query(collection(this.db, "users", this.localUser.uid, "chatids",), where("id", "==", docID));
    const s3 = onSnapshot(x3, async (querySnapshot) => {
      querySnapshot.forEach(async (doc3: any) => {
        neededData.showChatroomInSidebar = doc3.data()['shownInSidebar'];
      })
    })

  }

  loadChannels() {
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
      })
  }

  // SHOWS IN SIDEBAR WHICH CHANNEL IS ACTIVE
  showActive(value, positionInArray) {
    this.activeChatChannel = value;
  }

  // SHOWS IN SIDEBAR WHICH CHANNEL IS ACTIVE 
  async showActiveChat(value, positionInArray) {
    this.activeChatChannel = value;
    const otherUserRef = doc(this.db, "chatrooms", this.chatrooms[positionInArray].chatroomID, "users", this.chatrooms[positionInArray].userID);
    await updateDoc(otherUserRef, {
      newMessage: 0,
    });
  }

  // HIDE THE CHATROOM IN SIDEBAR WHEN THE USER CLICKS THE CLOSE IMG
  showChatroomInSidebar(chatroomid) {
    const chatroomRef = doc(this.db, "users", this.localUser.uid, "chatids", chatroomid);
    updateDoc(chatroomRef, {
      shownInSidebar: false,
    });
  }

  // OPENS THE CHATROOM WHEN THE USER CLICKS ON IT
  async openChatroom(chatroomID) {
    this.router.navigateByUrl('/mainpage/chatroom/' + chatroomID);
  }






}
