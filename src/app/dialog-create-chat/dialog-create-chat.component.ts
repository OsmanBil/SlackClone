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

class City {
  name: any;
  state: any;
  country: any;

  constructor(name, state, country) {
    this.name = name;
    this.state = state;
    this.country = country;
  }
  toString() {
    return this.name + ', ' + this.state + ', ' + this.country;
  }
}




@Component({
  selector: 'app-dialog-create-chat',
  templateUrl: './dialog-create-chat.component.html',
  styleUrls: ['./dialog-create-chat.component.scss']
})
export class DialogCreateChatComponent implements OnInit {





  messagesExample = [
    {
      date: 'Yesterday',
      day_message: {
        user: 'Oda Schneider',
        user_src: 'assets/img/p23.jpg',
        user_firstname: 'Oda:',
        user_message: 'ah ok alles klar 😄',
      },
    },
    {
      date: 'Monday, November 7th',
      day_message: {
        user: 'Osman Bilgin',
        user_src: 'assets/img/p24.jpg',
        user_firstname: 'Osman:',
        user_message: '😂😂😂 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam non rem similique? A totam amet optio ipsam quod. Quaerat quasi similique autem corporis nostrum tempora doloribus officiis neque molestiae eveniet?',
      },
    },
    {
      date: 'Sunday, November 6th',
      day_message: {
        user: 'Fabian Kalus',
        user_src: 'assets/img/p25.jpg',
        user_firstname: 'Fabian:',
        user_message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. 👌 Totam non rem similique? A totam amet optio ipsam quod. Quaerat quasi similique autem corporis nostrum tempora doloribus officiis neque molestiae eveniet?',
      },
    },
  ]

  chatroomUsers = { user: '', lastLogin: '45464' };
  chatroomMessages = { message: '', time: '', author: '' };

  chatroom =
    {
      usersss: this.chatroomUsers,
      chatsss: []
    };

  userData = {
    name: '',
    id: '',
    photoURL: '',
    newMessage: 0, 
    shownInSidebar: true
  };

  chatID: any;
  chatListener: [];


  db = getFirestore();

  unsub: any;


  mymodel;
  foundUsers: any[];
  usersWantToChat: any[] = [];

  @Input() chatActive: boolean = false;
  chatroomData = {
    numberOfUsers: 2
  }
  room: string[];
  roomidsSort: string[];
  roomid: string;

  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),
    messageAuthor: 'server',
    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
    messageAuthorID: 'server',
  }

  @Input() public messages: any[] = [];
  textMessage;
  localUserRef;
  localUserSnap;

  localUser: any;
  constructor(private firestore: AngularFirestore) { }
  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
  }

  async addMessage(newValue) {
    this.messageData.messageText = newValue;
    this.messageData.messageServerTime = serverTimestamp(),
      this.messageData.messageAuthor = this.localUser.displayName;
    this.messageData.messageTime = Timestamp.fromDate(new Date());
    this.messageData.messageAuthorImg = this.localUser.photoURL;
    await addDoc(collection(this.db, "chatrooms", this.roomid, "messages"), this.messageData);
    console.log(this.messages)
  }

  async valuechange(newValue) {

    this.mymodel = newValue;
    let mymodelLength = this.mymodel.lenght
    let mymodelLengthLowerCase = String(this.mymodel).toLocaleLowerCase();
    const usersRef = collection(this.db, "users")
    const q = query(usersRef, where('search', 'array-contains', mymodelLengthLowerCase));
    const querySnapshot = await getDocs(q);
    this.foundUsers = [];
    querySnapshot.forEach((doc) => {
      const founduser: any = { name: doc.data()['displayName'], imageUrl: doc.data()['photoURL'], id: doc.id };
      this.foundUsers.push(founduser)
    });
  }

  addUserWantToChat(i, input: HTMLInputElement) {
    if (this.usersWantToChat.includes(this.foundUsers[i]) == false) {
      this.usersWantToChat.push(this.foundUsers[i])
      input.value = '';
      const foundIndex = this.foundUsers.indexOf(this.foundUsers[i]);
      this.foundUsers.splice(foundIndex);

    } else {
      alert('This user already exists')
    }
  }

  deleteUserWantToChat(i) {
    this.usersWantToChat.splice(i);
  }



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
    await setDoc(doc(this.db, "chatrooms", this.roomid), this.chatroomData);
  }

  async setUsersForRoom() {
    for (let x = 0; x < this.room.length; x++) {
      let currentUserID = this.room[x];
      let docRef = collection(this.db, "users");
      let q = query(docRef, where("uid", "==", currentUserID))
      let querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        let currentUser: any = doc.data();
        this.userData.name = currentUser.displayName;
        this.userData.id = currentUser.uid;
        this.userData.photoURL = currentUser.photoURL;
      });
      console.log(this.userData.id)
      await setDoc(doc(this.db, "chatrooms", this.roomid, "users", this.userData.id), this.userData);
    }
  }

  loadMessages() {
    const messagesRef = collection(this.db, "chatrooms", this.roomid, "messages");
    const messagesQ = query(messagesRef, orderBy("messageServerTime"));
    const unsubscribe = onSnapshot(messagesQ, (snapshot) => {
      this.messages = [];
      snapshot.forEach((change) => {
        let loadMessage = { loadMessageText: change.data()['messageText'], loadMessageTime: change.data()['messageTime'], loadMessageServerTime: change.data()['messageServerTime'], loadMessageAuthor: change.data()['messageAuthor'], loadMessageAuthorImg: change.data()['messageAuthorImg'], id: change.id };
        loadMessage.loadMessageTime = this.convertTimestamp(loadMessage.loadMessageTime);
        this.messages.push(loadMessage);
      });
    });
  }

  async setFirstMessage() {
    for (let x = 0; x < this.room.length; x++) {

      let currentUserID = this.room[x];
      
      await setDoc(doc(this.db, "users", currentUserID, "chatids", this.roomid), { id: this.roomid, });

    };

    // for (let x = 0; x < this.room.length; x++) {
    //   let currentUserID = this.room[x];
    //   let docRef = collection(this.db, "users");
    //   let q = query(docRef, where("uid", "==", currentUserID))
    //   let querySnapshot = await getDocs(q);
    //   querySnapshot.forEach((doc) => {
    //     let currentUser: any = doc.data();
    //     this.userData.name = currentUser.displayName;
    //     this.userData.id = currentUser.uid;
    //   });
    //   await setDoc(doc(this.db, "chatrooms", this.roomid, "users", `${'user' + x}`), this.userData);
    //}




    // await addDoc(collection(this.db, "chatrooms", this.roomid, "messages"), this.messageData);
  }

  async createChat() {

    this.chatActive = true;

    this.setRoom();


    this.localUserRef = doc(this.db, "users", this.localUser.uid, "chatids", this.roomid);
    this.localUserSnap = await getDoc(this.localUserRef);

    if (this.localUserSnap.exists()) {
      this.chatActive = true;
      this.loadMessages();

    } else {
      this.chatActive = true;
      this.setUsersForRoom();
      this.setFirstMessage();
    }
  }


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
    if (minutes.lenght < 10) {
      minutes = '0' + minutes
    }
    date = dd + '/' + (mm + 1) + '/' + yyyy + ' ' + hours + ':' + minutes;
    return date;
  }

 


}
