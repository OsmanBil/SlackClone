import { Component, OnInit, Input, AfterViewChecked, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore } from '@firebase/firestore';
import { collection, getDocsFromCache, addDoc, increment, Unsubscribe, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { Observable } from 'rxjs';
import { AngularFirestore, } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ChatroomsService } from '../services/chatrooms.service';
import { deleteDoc, limit } from '@angular/fire/firestore';
import { LightboxComponent } from '../lightbox/lightbox.component';
import { BookmarksComponent } from '../bookmarks/bookmarks.component';
import { MatDialog } from '@angular/material/dialog';
import { SearchService } from '../services/search.service';

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
  @Input() public bookmarks: any[] = [];

  @HostListener('window:resize', ['$event'])
  onResize() {
  this.innerWidth = window.innerWidth;
  this.innerHeight = window.innerHeight;
}

  textMessage;
  localUser;
  numberOfLoadMessages = 10;
  scrollCounter = 0;
  panelOpenState = false
  innerWidth: Number;
  innerHeight: Number;

  @Input() lightboxOpen = false;
  @Input() lightboxImg = '';

  searchText = '';
  userNamesAsString = '';
  @Input() userNamesAsStringWithoutAnd = '';

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, private router: Router,
    private search: SearchService,
    private dialog: MatDialog,
    public chatroomService: ChatroomsService) {

  }

  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    this.route.paramMap.subscribe(paramMap => {
      this.searchText = '';
      this.numberOfLoadMessages = 10;
      this.currentChatroomID = paramMap.get('id');
      this.loadMessages();
      this.loadUsers();
      this.loadBookmarks();
    })
    this.setSearchValue();
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }


  // SCROLLS TO BOTTOM WHEN LOADING IS FINISH, BUT SHOULD ONLY ONCE, THAT`s THE REASON FOR THE COUNTER
  ngAfterViewChecked() {
    if (this.numberOfLoadMessages == 10 && this.scrollCounter == 0) {
      this.scrollToBottom();
      this.scrollCounter++
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  scrollToBottom2(value: any): void {
    
      this.scrollToBottom();
      console.log(value)
    
  }


  async loadBookmarks() {

    const bookmarksRef = collection(this.db, 'chatrooms', this.currentChatroomID, 'bookmarks');
    const loadedChatID = this.currentChatroomID;
    const unsubscribe2 = onSnapshot(bookmarksRef, async (bookmarksDocs) => {
      if (loadedChatID != this.currentChatroomID) {
        unsubscribe2()
      } else {
        this.bookmarks = [];
        bookmarksDocs.forEach((doc: any) => {
          let bookmarkData = {
            link: '',
            name: '',
            id: '',
          }
          bookmarkData.link = doc.data().link;
          bookmarkData.name = doc.data().name;
          bookmarkData.id = doc.id
          this.bookmarks.push(bookmarkData)
        })
      }
    })
  }


  async loadMoreMessages() {
    this.numberOfLoadMessages += 10;
    await this.loadMessages();
    await this.loadUsers();
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
            loadMessageImg: postDoc.data().messageImg,
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

  // GET NUMBER OF CHATROOM USERS FOR EACH CHATROOM
  async getNumberOfChatroomUsers(chatuserData) {
    const localUserOneChatroom = query(collection(this.db, "chatrooms"), where("id", "==", this.currentChatroomID));
    const localUserOneChatroomDoc = await getDocs(localUserOneChatroom);
    (localUserOneChatroomDoc).forEach(async (onechatroom: any) => {
      chatuserData.numberOfChatUsers = onechatroom.data().numberOfUsers
    });
  }

  // LOAD ALL USERS, EXCEPT THE LOCAL USER. THEN WITH THE USER ID THE CURRENT NAME AND IMG. IF IT´s A GROUP CHAT THE IMAGE WILL BE A FIXED ONE 
  async loadUsers() {
    let chatuserData: any = {
      id: '',
      numberOfChatUsers: Number,
      name: [],
      photoURL: '',
      isOnline: '',
      student: 'student',
      namesAsString: '',
    }
    await this.getNumberOfChatroomUsers(chatuserData)
    const otherUsersID = query(collection(this.db, "chatrooms", this.currentChatroomID, "users"), where('id', '!=', this.localUser.uid))
    const querySnapshotsUsersID = await getDocs(otherUsersID);
    this.chatusers = [];

    querySnapshotsUsersID.forEach((doc: any) => {
      this.userNamesAsString = '';
      chatuserData.id = doc.data().id;
      const loadedChatID = this.currentChatroomID;
      const chatroomOtherUsers = query(collection(this.db, "users"), where('uid', '==', doc.data().id))
      const unsub = onSnapshot(chatroomOtherUsers, async (chatroomOtherUserID: any) => {

        chatroomOtherUserID.forEach((doc2: any) => {
          if (loadedChatID != this.currentChatroomID) {
            unsub();
          }
          else {
            if (chatuserData.numberOfChatUsers > 2) {
              chatuserData.photoURL = '/assets/img/groupchat.png';
            }
            else {
              chatuserData.photoURL = doc2.data().photoURL;
            }
            chatuserData.name.push(doc2.data().displayName);
            this.userNamesAsString += doc2.data().displayName + ' ' + 'and' + ' ';
            chatuserData.isOnline = doc2.data().isOnline;
            chatuserData.student = 'student';
            this.scrollCounter = 0;
          }
        }
        )
        this.userNamesAsStringWithoutAnd = this.userNamesAsString.substring(0, this.userNamesAsString.length - 4)
      })
    })

    this.chatusers.push(chatuserData)
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


  setSearchValue() {
    this.search.getData().subscribe(s => {
      this.searchText = s;

    });
  }

  // OPENS THE LIGHTBOX
  openLightbox(url) {
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

  openBookmarks(chatroomID) {
    let dialog = this.dialog.open(BookmarksComponent);
    dialog.componentInstance.currentChatroomID = chatroomID;
  }

  async deleteBookmark(deletBookmarkID) {
    await deleteDoc(doc(this.db, 'chatrooms', this.currentChatroomID, 'bookmarks', deletBookmarkID))
  }

}
