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



  mymodel;
  foundUsers: any[];
  @Input() usersWantToChat: any[] = [];


  room: string[];
  roomidsSort: string[];
  roomid: string;



  @Input() oldMessages: any[] = [];


  @Input() public messages: any[] = [];
  textMessage;
  localUserRef;
  localUserSnap;

  localUser: any;
  @Input() loadingFinish = false;

  searchText = '';

  constructor(private firestore: AngularFirestore, private router: Router, private search: SearchService,) { }

  async ngOnInit() {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    await this.loadOldMessages();

    setTimeout(() => { this.check() }, 500);
    this.setSearchValue();
  }

  


  async loadOldMessages() {
    // LOAD FORM LOCAL USERS ALL CHATROMM IDS
    const chatroomRefLocalUser = collection(this.db, "users", this.localUser.uid, "chatids");
    const chatroomLocalUserQuerysnapshot = await getDocs(chatroomRefLocalUser);
    chatroomLocalUserQuerysnapshot.forEach(async (doc) => {
      let messageData = {
        chatroomID: '',
        chatroomNumberUsers: '',
        messageText: '',
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

      // GET THE NUMBERS OF USERS OF THE CHATROOM
      const chatrooms = collection(this.db, "chatrooms");
      const chatroomsQ = query(chatrooms, where('id', '==', doc.id));
      const chatroomsQuerySnapshot = await getDocs(chatroomsQ);
      chatroomsQuerySnapshot.forEach(async (chatroomDoc: any) => {
        messageData.chatroomNumberUsers = chatroomDoc.data().numberOfUsers
      })

      // FOR EACH CHATROOM ID THERE IS A CHECK WHO IS THE OTHER CHATROOM USERS
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
          if(messageData.messageOtherUserName.length > 1)
          {
            messageData.messageOtherUserImg = '/assets/img/groupchat.png'
          }else {
          messageData.messageOtherUserImg = doc5.data().photoURL}

        })
      })

      // FOR EACH CHATROOM ID LOAD THE LAST MESSAGE (TIME, TEXT, IMG etc. )
      const allMessage = collection(this.db, "chatrooms", doc.id, "messages");
      const allMessageQ = query(allMessage, orderBy('messageTime', 'desc'), limit(1));
      const allMessagequerySnapshot = await getDocs(allMessageQ)
      allMessagequerySnapshot.forEach(async (doc2: any) => {
        messageData.messageAuthorID = doc2.data().messageAuthorID
        messageData.messageTime = this.convertTimestamp(doc2.data().messageTime)
        messageData.messageServerTime = doc2.data().messageServerTime
        messageData.messageText = doc2.data().messageText
        messageData.messageImg = doc2.data().messageImg

        // FOR THE LAST MESSAGE LOAD THE IMG AND NAME OF THE AUTHOR OF THE LAST MESSAGE
        const authorRef = collection(this.db, "users")
        const q2 = query(authorRef, where('uid', '==', doc2.data().messageAuthorID))
        const querySnapshot2 = await getDocs(q2)
        querySnapshot2.forEach((doc3: any) => {
          messageData.messageAuthor = doc3.data().displayName
          messageData.messageAuthorImg = doc3.data().photoURL
        })
        this.oldMessages.push(messageData)
      })
    })
    
  }


  check() {
    this.oldMessages.sort((a, b) => b.messageServerTime - a.messageServerTime)
    this.loadingFinish = true;
  }

  // search Users
  async valuechange(newValue) {
    this.mymodel = newValue;
    // let mymodelLength = this.mymodel.lenght
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
    }
  }

  // SET THE CHATROOM ID IN EVERY USER BY FIREBASE
  async setChatroomsInUsers() {
    for (let x = 0; x < this.room.length; x++) {
      let currentUserID = this.room[x];
      await setDoc(doc(this.db, "users", currentUserID, "chatids", this.roomid), { id: this.roomid, shownInSidebar: true });
    };
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
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    date = dd + '/' + (mm + 1) + '/' + yyyy + ' ' + hours + ':' + minutes;
    return date;
  }
  
  setSearchValue(){
    this.search.getData().subscribe(s => {                  
      this.searchText = s; 
      
    });
  }

  // BEISPIELE VON MIHAI


  // LOAD 3 ist aus dem Call und könnte die Abfrage where komplett ersetzen
  async loadOldMessages3() {
    const chatroomRef = collection(this.db, "users", this.localUser.uid, "chatids");
    const chatRoomSnapshot = (await getDocs(chatroomRef)).docs;

    console.log('All ChatRooms :', chatRoomSnapshot);

    for (let chatRoomIndex = 0; chatRoomIndex < chatRoomSnapshot.length; chatRoomIndex++) {
      const docChatRoom = chatRoomSnapshot[chatRoomIndex];

      const messages = collection(this.db, "chatrooms", docChatRoom.id, "messages");
      const lastMessagesQuery = query(messages, orderBy('messageTime', "desc"), limit(1));
      const lastMessagesSnapshot = (await getDocs(lastMessagesQuery)).docs;
      console.log('All LastMessages from chatRoomIndex' + chatRoomIndex +' :', lastMessagesSnapshot );

      for (let lastMessageIndex = 0; lastMessageIndex < lastMessagesSnapshot.length; lastMessageIndex++) {
        const lastMessage = lastMessagesSnapshot[lastMessageIndex];

        let messageData = {
          messageText: '',
          messageServerTime: Timestamp,
          messageAuthor: '',
          messageTime: Timestamp,
          messageAuthorImg: '',
          messageAuthorID: '',
        };

        messageData.messageAuthorID = lastMessage.data()['messageAuthorID']
        messageData.messageTime = this.convertTimestamp(lastMessage.data()['messageTime'])
        messageData.messageText = lastMessage.data()['messageText']


        // DAS HIER
        const authorRef = collection(this.db, "users")
        const userRef = doc(authorRef, lastMessage.data()['messageAuthorID']);
        const author = await getDoc(userRef);
        // 


        messageData.messageAuthor = author.data()['displayName']
        messageData.messageAuthorImg = author.data()['photoURL']

        console.log('Pushing MessageData from chatRoomIndex ' + chatRoomIndex + ', lastMessageIndex ' + lastMessageIndex + ' :', messageData);
        this.oldMessages.push(messageData)
      }

    }
   
  }

  async loadOldMessages2() {
    const chatroomRef = collection(this.db, "users", this.localUser.uid, "chatids");
    const chatRoomSnapshot = (await getDocs(chatroomRef)).docs;

    for (let index = 0; index < chatRoomSnapshot.length; index++) {
      const docChatRoom = chatRoomSnapshot[index];


      let messageData = {
        messageText: '',
        messageServerTime: Timestamp,
        messageAuthor: '',
        messageTime: Timestamp,
        messageAuthorImg: '',
        messageAuthorID: '',
      };

      const messages = collection(this.db, "chatrooms", docChatRoom.id, "messages");
      const lastMessagesQuery = query(messages, orderBy('messageTime', "desc"), limit(1));


      const lastMessagesSnapshot = (await getDocs(lastMessagesQuery)).docs;

      for (let index = 0; index < lastMessagesSnapshot.length; index++) {
        const doc2 = lastMessagesSnapshot[index];

        messageData.messageAuthorID = doc2.data()['messageAuthorID']
        messageData.messageTime = this.convertTimestamp(doc2.data()['messageTime'])
        messageData.messageText = doc2.data()['messageText']

        const authorRef = collection(this.db, "users")
        const authorQuery = query(authorRef, where('uid', '==', doc2.data()['messageAuthorID']))
        const querySnapshot2 = await getDocs(authorQuery)
        querySnapshot2.forEach((doc3: any) => {
          messageData.messageAuthor = doc3.data().displayName
          messageData.messageAuthorImg = doc3.data().photoURL
        });

        this.oldMessages.push(messageData)
      }

    }
  }

 

}
