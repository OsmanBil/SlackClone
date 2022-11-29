import { Component, OnInit, Input, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
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
export class ChatroomComponent implements OnInit, AfterViewChecked {
  db = getFirestore();
  @Input() currentChatroomID;
  @Input() public messages: any[] = [];
  @Input() public chatusers: any[] = [];
  @Input() public chatusersID: any[] = [];
  textMessage;
  localUser;
  otherUserID;

  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),
    messageAuthor: 'server',
    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
    messageAuthorID: '',

  }

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore,) {

  }

  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    this.chatusersID = [];
    this.route.paramMap.subscribe(paramMap => {
      this.currentChatroomID = paramMap.get('id');
      this.loadMessages();
      this.loadUsers();
    })
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  loadMessages() {
    const messagesRef = collection(this.db, "chatrooms", this.currentChatroomID, "messages");
    const messagesQ = query(messagesRef, orderBy("messageServerTime"));
    const unsubscribe = onSnapshot(messagesQ, async (snapshot) => {
      this.messages = [];
      snapshot.forEach((postDoc: any) => {
        let loadMessage = {
          loadMessageText: postDoc.data()['messageText'], loadMessageTime: postDoc.data()['messageTime'],
          loadMessageServerTime: postDoc.data()['messageServerTime'],
          loadMessageAuthor: postDoc.data().messageAuthor, loadMessageAuthorImg: postDoc.data().messageAuthorImg,
          loadMessageAuthorID: postDoc.data().messageAuthorID, id: postDoc.id
        };
        loadMessage.loadMessageTime = this.convertTimestamp(loadMessage.loadMessageTime);
        this.messages.push(loadMessage)
        // this.loadAuthor(postDoc);
      });
    });
  }
  async loadAuthor(postDoc) {
    let user = query(collection(this.db, "users"), where("uid", "==", postDoc.data().messageAuthorID));
    let querySnapshot = await getDocs(user);
    querySnapshot.forEach((userDoc) => {
      let post = {
        loadMessageAuthor: postDoc.data().messageAuthor,
        loadMessageAuthorImg: postDoc.data().messageAuthorImg,
        loadMessageAuthorID: postDoc.data().messageAuthorID,
        loadMessageText: postDoc.data().messageText,
        loadMessageTime: this.convertTimestamp(postDoc.data().messageTime),

      };
      this.messages.push(post);
    });
  }


  async loadUsers() {
    const q = collection(this.db, "chatrooms", this.currentChatroomID, "users")
    const querySnapshotsUsersID = await getDocs(q);
    this.chatusers = [];
    this.chatusersID = [];
    querySnapshotsUsersID.forEach((doc: any) => {
      if (doc.data().id !== this.localUser.uid) {
        this.chatusersID.push({
          id: doc.data().id,
        })
        this.otherUserID = doc.data().id;
      }
    })
    this.chatusers = [];
    for (let i = 0; i < this.chatusersID.length; i++) {
      const unsub = onSnapshot(doc(this.db, "users", this.chatusersID[i].id), { includeMetadataChanges: true },
        (doc: any) => {
          this.chatusers = [];
          let chatuserData = {
            id: doc.data().id, name: doc.data().displayName, photoURL: doc.data().photoURL,
            isOnline: doc.data().isOnline, student: 'student',
          }
          this.chatusers.push(chatuserData)

        })
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
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    date = dd + '/' + (mm + 1) + '/' + yyyy + ' ' + hours + ':' + minutes;
    return date;
  }

  alertlist(){
    alert('Ist auf der To-Do Liste ;)')
  }


}
