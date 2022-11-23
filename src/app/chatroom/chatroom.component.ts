import { Component, OnInit } from '@angular/core';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";


@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit {
  db = getFirestore();
  currentChatroomID;
  messages;
  textMessage;
localUser;

  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),
    messageAuthor: 'server',
    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
  }

  constructor() { }

  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    this.currentChatroomID = window.location.pathname.split('/').pop()
    this.loadMessages();
  }

  loadMessages() {
    const messagesRef = collection(this.db, "chatrooms", this.currentChatroomID, "messages");
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

  
  convertTimestamp(timestamp) {
    let date = timestamp.toDate();
    let mm = date.getMonth();
    let dd = date.getDate();
    let yyyy = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let secondes = date.getSeconds();
    if (secondes.lenght < 2) {
      secondes = 0 + secondes
    }
    if (hours.lenght < 2) {
      hours = 0 + hours
    }
    if (minutes.lenght < 2) {
      minutes = 0 + minutes
    }
    date = dd + '/' + (mm + 1) + '/' + yyyy + ' ' + hours + ':' + minutes;
    return date;
  }

  async addMessage(newValue) {
    this.messageData.messageText = newValue;
    this.messageData.messageServerTime = serverTimestamp(),
      this.messageData.messageAuthor = this.localUser.displayName;
    this.messageData.messageTime = Timestamp.fromDate(new Date());
    this.messageData.messageAuthorImg = this.localUser.photoURL;
    await addDoc(collection(this.db, "chatrooms", this.currentChatroomID, "messages"), this.messageData);
    console.log(this.messages)
  }

}
