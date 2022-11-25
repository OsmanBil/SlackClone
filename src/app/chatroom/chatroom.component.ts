import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit {
  db = getFirestore();
  currentChatroomID;
  @Input() public messages: any[] = [];
  @Input() public chatusers: any[] = [];
  textMessage;
  localUser;

  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),
    messageAuthor: 'server',
    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
    messageAuthorID: '',

  }

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore,) {

  }

  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    this.route.paramMap.subscribe(paramMap => {
      this.currentChatroomID = paramMap.get('id');
      this.loadMessages();
      this.loadUsers();
    })

  }

  loadMessages() {
    const messagesRef = collection(this.db, "chatrooms", this.currentChatroomID, "messages");
    const messagesQ = query(messagesRef, orderBy("messageServerTime"));
    const unsubscribe = onSnapshot(messagesQ, async (snapshot) => {
      this.messages = [];
      snapshot.forEach(async (change: any) => {
        let loadMessage = {
          loadMessageText: change.data()['messageText'], loadMessageTime: change.data()['messageTime'], loadMessageServerTime: change.data()['messageServerTime'],
          loadMessageAuthor: change.data().messageAuthorID, loadMessageAuthorID: change.data().messageAuthorID, loadMessageAuthorImg: change.data()['messageAuthorImg'], id: change.id
        };
        loadMessage.loadMessageTime = this.convertTimestamp(loadMessage.loadMessageTime);
        const docRef = doc(this.db, "users", change.data().messageAuthorID);
        const docSnap: any = await getDoc(docRef);

        console.log(docSnap.id)
        console.log(docSnap)
        console.log(docSnap.data()['displayName'])

        this.messages.push(loadMessage);
      });
      console.log(this.messages)
      console.log(this.messages.length)
      for (let x = 0; x < this.messages.length; x++) {
        const docRef = doc(this.db, "users", this.messages[x].loadMessageAuthorID);
        const docSnap = await getDoc(docRef);
        console.log(docRef)
        console.log()
        console.log()

      }

  });
}

  async loadUsers(){
  const q = collection(this.db, "chatrooms", this.currentChatroomID, "users")
  const querySnapshotsUsers = await getDocs(q);
  this.chatusers = [];
  querySnapshotsUsers.forEach((doc: any) => {
    if (doc.data().id !== this.localUser.uid) {
      this.chatusers.push({ id: doc.data().id, name: doc.data().name, photoURL: doc.data().photoURL, student: 'student' })
    }
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

  async addMessage(newValue) {
  this.messageData.messageText = newValue;
  this.messageData.messageServerTime = serverTimestamp(),
    this.messageData.messageAuthor = this.localUser.displayName;
  this.messageData.messageAuthorID = this.localUser.uid;
  this.messageData.messageTime = Timestamp.fromDate(new Date());
  this.messageData.messageAuthorImg = this.localUser.photoURL;
  await addDoc(collection(this.db, "chatrooms", this.currentChatroomID, "messages"), this.messageData);
}

}
