import { Component, Input, OnInit } from '@angular/core';
import { Chatroom } from 'src/models/chatrooms.class';
import { Message } from 'src/models/message.class';


import { chatroomUser } from 'src/models/chatroomUser.class';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from '@firebase/util';

import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { checkActionCode, user } from '@angular/fire/auth';
import { from, min, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { limit } from '@angular/fire/firestore';
import { SearchService } from '../services/search.service';




@Component({
  selector: 'app-dialog-create-chat',
  templateUrl: './dialog-create-chat.component.html',
  styleUrls: ['./dialog-create-chat.component.scss']
})
export class DialogCreateChatComponent implements OnInit {

  db = getFirestore();

  userData = {
    name: '',
    id: '',
    photoURL: '',
    newMessage: 0,
    shownInSidebar: true
  };

  chatID: any;
  mymodel;
  @Input() usersWantToChat: any[] = [];


  room: string[];
  roomidsSort: string[];
  roomid: string;

  @Input() oldMessages: any[] = [];
  @Input() public messages: any[] = [];
  localUserRef;
  localUserSnap;
  @Input() localUser: any;
  @Input() loadingFinish = false;

  searchText = '';
  @Input() searchUsers = '';

  @Input() allUsers: any[] = [];

  constructor(private firestore: AngularFirestore, private router: Router, private search: SearchService,) { }

  // load local user + load old messages + timeout because the backend need some time + set the searchvalue to null + load a list of all users
  async ngOnInit() {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    await this.loadOldMessages();
    setTimeout(() => { this.sortOldMessages() }, 500);
    this.setSearchValue();
    this.searchUsers = '';
    this.loadAllUsers();
  }

  // LOAD FORM LOCAL USERS ALL CHATROMM IDS
  async loadOldMessages() {
    const chatroomRefLocalUser = collection(this.db, "users", this.localUser.uid, "chatids");
    const chatroomLocalUserQuerysnapshot = await getDocs(chatroomRefLocalUser);
    chatroomLocalUserQuerysnapshot.forEach(async (doc) => {
      let messageData = {
        chatroomID: '',
        chatroomNumberUsers: '',
        messageText: null,
        messageImg: '',
        messageServerTime: Timestamp,
        messageAuthor: '',
        messageTime: Timestamp,
        messageAuthorImg: '',
        messageAuthorID: '',
        messageOtherUserID: '',
        messageOtherUserName: [],
        messageOtherUserImg: '',
      }
      messageData.chatroomID = doc.id;

      this.loadNumberOfChatroomUsers(doc, messageData);
      this.loadOtherUsersChatrooms(doc, messageData)
      this.loadLastMessage(doc, messageData);


    })

  }

  // GET THE NUMBERS OF USERS OF THE CHATROOM
  async loadNumberOfChatroomUsers(doc, messageData) {
    const chatrooms = collection(this.db, "chatrooms");
    const chatroomsQ = query(chatrooms, where('id', '==', doc.id));
    const chatroomsQuerySnapshot = await getDocs(chatroomsQ);
    chatroomsQuerySnapshot.forEach(async (chatroomDoc: any) => {
      messageData.chatroomNumberUsers = chatroomDoc.data().numberOfUsers
    })
  }

  // FOR EACH CHATROOM ID THERE IS A CHECK WHO IS THE OTHER CHATROOM USERS
  async loadOtherUsersChatrooms(doc, messageData) {
    const chatroomOtherUser = collection(this.db, "chatrooms", doc.id, "users");
    const chatroomOtherUserQ = query(chatroomOtherUser, where('id', '!=', this.localUser.uid));
    const chatroomOtherUserquerySnapshot = await getDocs(chatroomOtherUserQ)
    chatroomOtherUserquerySnapshot.forEach(async (doc4: any) => {
      messageData.messageOtherUserID = doc4.data().uid;
      const authorRef = collection(this.db, "users")
      const q2 = query(authorRef, where('uid', '==', doc4.data().id))
      const querySnapshot2 = await getDocs(q2)
      querySnapshot2.forEach((doc5: any) => {
        messageData.messageOtherUserName.push(doc5.data().displayName)
        if (messageData.messageOtherUserName.length > 1) {
          messageData.messageOtherUserImg = '/assets/img/groupchat.png'
        } else {
          messageData.messageOtherUserImg = doc5.data().photoURL
        }
      })
    })
  }

  // FOR EACH CHATROOM ID LOAD THE LAST MESSAGE (TIME, TEXT, IMG etc. )
  async loadLastMessage(doc, messageData) {
    const allMessage = collection(this.db, "chatrooms", doc.id, "messages");
    const allMessageQ = query(allMessage, orderBy('messageTime', 'desc'), limit(1));
    const allMessagequerySnapshot = await getDocs(allMessageQ)
    allMessagequerySnapshot.forEach(async (doc2: any) => {
      messageData.messageAuthorID = doc2.data().messageAuthorID
      messageData.messageTime = this.convertTimestamp(doc2.data().messageTime)
      messageData.messageServerTime = doc2.data().messageServerTime
      if (doc2.data().messageText == '') {
        messageData.messageText = null
      } else {
        messageData.messageText = doc2.data().messageText
      }
      messageData.messageImg = doc2.data().messageImg
      this.loadUserDataOfMessage(doc2, messageData);
    })
  }

  // FOR THE LAST MESSAGE LOAD THE IMG AND NAME OF THE AUTHOR OF THE LAST MESSAGE
  async loadUserDataOfMessage(doc2, messageData) {
    const authorRef = collection(this.db, "users")
    const q2 = query(authorRef, where('uid', '==', doc2.data().messageAuthorID))
    const querySnapshot2 = await getDocs(q2)
    querySnapshot2.forEach((doc3: any) => {
      messageData.messageAuthor = doc3.data().displayName
      messageData.messageAuthorImg = doc3.data().photoURL
    })
    this.oldMessages.push(messageData)
  }

  // sort the old messages by time
  sortOldMessages() {
    this.oldMessages.sort((a, b) => b.messageServerTime - a.messageServerTime)
    this.loadingFinish = true;
  }

  // search Users
  async valuechange(newValue) {
    this.searchUsers = newValue;
  }

  addUserWantToChat(i, input: HTMLInputElement) {
    if (this.usersWantToChat.includes(i) == false) {
      this.usersWantToChat.push(i)
      input.value = '';
      this.searchUsers = '';
    } else {
      alert('This user already exists')
    }
  }

  // delete the user from the list userswantstochat
  deleteUserWantToChat(i) {
    const foundIndex = this.usersWantToChat.indexOf(i);
    this.usersWantToChat.splice(foundIndex, 1);
  }

  // CREATE CHATROOM OR LINK TO THE EXISTING ROOM
  async createChat() {
    this.setRoom();
    this.localUserRef = doc(this.db, "users", this.localUser.uid, "chatids", this.roomid);
    this.localUserSnap = await getDoc(this.localUserRef);

    if (this.localUserSnap.exists()) {
      const chatroomRef = doc(this.db, "users", this.localUser.uid, "chatids", this.roomid);
      updateDoc(chatroomRef, {
        shownInSidebar: true,
      });
      this.router.navigateByUrl('/mainpage/chatroom/' + this.localUserSnap.data().id);

    } else {
      this.setUsersForRoom();
      this.setChatroomsInUsers();

    }
  }

  // SET CHATROOMID
  // CREATE THE ID BY MAKING ADDING ALL CHATROOMUSERS IDS (SORTED)
  async setRoom() {
    this.room = [this.localUser.uid];
    for (let r1 = 0; r1 < this.usersWantToChat.length; r1++) {
      this.room.push(this.usersWantToChat[r1].id)
    };
    this.roomidsSort = this.room.sort();
    this.roomid = '';
    for (let r = 0; r < this.roomidsSort.length; r++) {
      this.roomid += this.roomidsSort[r]
    }
    await setDoc(doc(this.db, "chatrooms", this.roomid), {
      numberOfUsers: this.roomidsSort.length,
      id: this.roomid
    });
  }

  // IF THERE IS NO EXISTINGS CHATROOM THINGS FUNCITON CREATES A NEW CHATROOM
  async setUsersForRoom() {
    for (let x = 0; x < this.room.length; x++) {
      let currentUserID = this.room[x];
      let docRef = collection(this.db, "users");
      let q = query(docRef, where("uid", "==", currentUserID))
      let querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        let currentUser: any = doc.data();
        this.userData.id = currentUser.uid;
      });
      await setDoc(doc(this.db, "chatrooms", this.roomid, "users", this.userData.id), this.userData);
      setTimeout(() => { this.router.navigateByUrl('/mainpage/chatroom/' + this.roomid) }, 500);
    }

  }

  // SET THE CHATROOM ID IN EVERY USER BY FIREBASE
  async setChatroomsInUsers() {
    for (let x = 0; x < this.room.length; x++) {
      let currentUserID = this.room[x];
      await setDoc(doc(this.db, "users", currentUserID, "chatids", this.roomid), { id: this.roomid, shownInSidebar: true });
    };
  }

  // load all Users for the search function
  async loadAllUsers() {
    this.allUsers = [];
    const usersRef = collection(this.db, 'users');
    const usersDocs = await getDocs(usersRef);

    usersDocs.forEach((doc: any) => {
      let oneUserData = {
        name: '',
        photoURL: '',
        id: '',
      }
      oneUserData.name = doc.data().displayName;
      oneUserData.photoURL = doc.data().photoURL;
      oneUserData.id = doc.data().uid;
      if (oneUserData.id != this.localUser.uid) {
        this.allUsers.push(oneUserData);
      }
    })
  }

  // convert the timestamps
  convertTimestamp(timestamp) {
    let date = timestamp.toDate();
    let mm = date.getMonth();
    let dd = date.getDate();
    let yyyy = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let secondes = date.getSeconds();
    if (secondes < 10) {
      secondes = '0' + secondes
    }
    if (hours < 10) {
      hours = '0' + hours
    }
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    date = dd + '/' + (mm + 1) + '/' + yyyy + ' ' + hours + ':' + minutes;
    return date;
  }

  setSearchValue() {
    this.search.getData().subscribe(s => {
      this.searchText = s;
    });
  }

  async setShownInSidebarToTrue(currentChatroomID) {
    const otherUserChatroomRef = doc(this.db, "users", this.localUser.uid, "chatids", currentChatroomID);
    await updateDoc(otherUserChatroomRef, {
      shownInSidebar: true,
    })
  }




}
