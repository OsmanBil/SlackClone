import { Component, OnInit, Input, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, increment, Unsubscribe, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { Observable } from 'rxjs';
import { AngularFirestore, } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ChatroomsService } from '../services/chatrooms.service';
import { limit } from '@angular/fire/firestore';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, AfterViewChecked {
  db = getFirestore();
  @Input() currentChatroomID;
  @Input() currentChatroomID2;
  @Input() public messages: any[] = [];
  @Input() public chatusers: any[] = [];
  @Input() public chatusersID: any[] = [];
  textMessage;
  localUser;
  otherUserID;
  @Input() activeChatroomID = '';

  numberOfLoadMessages = 10;
  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),
    messageAuthor: 'server',
    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
    messageAuthorID: '',
  }

  loadMessageData = {
    loadMessageText: '',
    loadMessageTime: Timestamp,
    loadMessageServerTime: Timestamp,
    loadMessageAuthor: '',
    loadMessageAuthorImg: '',
    loadMessageAuthorID: '',
    messageID: ''
  };

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, private router: Router,
    public chatroomService: ChatroomsService) {

  }


  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    this.chatusersID = [];
    this.route.paramMap.subscribe(paramMap => {
      this.numberOfLoadMessages = 10;
      this.currentChatroomID = paramMap.get('id');
      this.loadMessages();
      this.loadUsers();

    })
    this.scrollToBottom();

  }

  ngAfterViewChecked() {
    if(this.numberOfLoadMessages == 10) {
      this.scrollToBottom();
    } 
    
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  scrollToTop(): void {
    try {
      this.myScrollContainer.nativeElement.scrollToBottom = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  async loadMoreMessages() {
    this.numberOfLoadMessages += 10;
    this.chatusersID = [];
    await this.loadMessages();
    await this.loadUsers();
    this.scrollToTop();
  }

  loadMessages() {
    const messagesRef = collection(this.db, "chatrooms", this.currentChatroomID, "messages");
    const messagesQ = query(messagesRef, orderBy("messageServerTime", "desc"), limit(this.numberOfLoadMessages));

    const loadedChatID = this.currentChatroomID;
    const unsubscribe = onSnapshot(messagesQ, async (snapshot) => {

      if (loadedChatID != this.currentChatroomID) {
        unsubscribe()
      }
      else {
        this.messages = [];
        snapshot.forEach((postDoc: any) => {

          let loadMessage = {
            loadMessageText: postDoc.data()['messageText'],
            loadMessageTime: postDoc.data()['messageTime'],
            loadMessageServerTime: postDoc.data()['messageServerTime'],
            loadMessageAuthor: postDoc.data().messageAuthor,
            loadMessageAuthorImg: postDoc.data().messageAuthorImg,
            loadMessageAuthorID: postDoc.data().messageAuthorID,
            id: postDoc.id
          };
          loadMessage.loadMessageTime = this.convertTimestamp(loadMessage.loadMessageTime);

          // LOAD AUTHOR
          const authorRef = query(collection(this.db, "users"), where("uid", "==", loadMessage.loadMessageAuthorID));
          const unsubscribe2 = onSnapshot(authorRef, async (snapshot2) => {
            snapshot2.forEach((postDoc2: any) => {
              loadMessage.loadMessageAuthor = postDoc2.data().displayName;
              loadMessage.loadMessageAuthorImg = postDoc2.data().photoURL;
            })
          })
          this.messages.push(loadMessage)
        });
      }
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
    const loadedChatID = this.currentChatroomID;
    for (let i = 0; i < this.chatusersID.length; i++) {
      const unsub = onSnapshot(doc(this.db, "users", this.chatusersID[i].id), { includeMetadataChanges: true },
        (doc: any) => {
          if (loadedChatID != this.currentChatroomID) {
            unsub()
          }
          else {
            this.chatusers = [];
            let chatuserData = {
              id: doc.data().id, name: doc.data().displayName, photoURL: doc.data().photoURL,
              isOnline: doc.data().isOnline, student: 'student',
            }
            this.chatusers.push(chatuserData)
          }
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

  alertlist() {
    alert('Ist auf der To-Do Liste ;)')
  }


}
