import { Component, OnInit, Input, HostListener } from '@angular/core';
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
import { SidenavToggleService } from '../services/sidenav-toggle.service';


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
  innerWidth: number;

  @HostListener('window:resize', ['$event'])
  onResize() {
  this.innerWidth = window.innerWidth;
}

  constructor(
    public dialog: MatDialog, 
    private firestore: AngularFirestore, 
    private router: Router, 
    private route: ActivatedRoute,
    public chatroomService: ChatroomsService,
    public sidenavService: SidenavToggleService) { }


  ngOnInit(): void {
    this.loadChatroomData();
    this.innerWidth = window.innerWidth;

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
    let localUserChatIDSCollection = collection(this.db, "users", this.localUser['uid'], "chatids");
    const unsubscribe = onSnapshot(localUserChatIDSCollection, async (localUserChatID) => {
      this.chatrooms = [];
      localUserChatID.forEach(async (chatroom) => {
        let neededData: any = {
          chatroomID: '',
          numberOfChatUsers: Number,
          showChatroomInSidebar: '',
          userID: '',
          userImg: '',
          userIsOnline: '',
          userName: '',
          newMessageforOtherUser: '',
        }
        neededData.chatroomID = chatroom.id;
        await this.getNumberOfChatroomUsers(neededData, chatroom)
        this.checkIfNewMessage(neededData, chatroom);
        this.checkIfChatroomIsShownInSidebar(neededData, chatroom.id);
        this.chatrooms.push(neededData);
      })
    })
    this.loadChannels();
  }


  // GET NUMBER OF CHATROOM USERS FOR EACH CHATROOM
  async getNumberOfChatroomUsers(neededData, chatroom){
    const localUserOneChatroom = query(collection(this.db, "chatrooms"), where("id", "==", chatroom.id));
    const localUserOneChatroomDoc = await getDocs(localUserOneChatroom);
    (localUserOneChatroomDoc).forEach(async (onechatroom: any) => {
      neededData.numberOfChatUsers = onechatroom.data().numberOfUsers
    });
  }

   // ÜBERPRÜFT DAUERHAFT OB NEUE NACHRICHT AN LOCAL USER GEGANGEN IST
   checkIfNewMessage(neededData, chatroom) {
    const otherUsersRef = query(collection(this.db, "chatrooms", chatroom.id, "users"), where("id", "!=", this.localUser.uid));
    const s1 = onSnapshot(otherUsersRef, async (otherUserSnapshot) => {
      otherUserSnapshot.forEach(async (doc2: any) => {
        this.loadOtherUsers(neededData, doc2);
      })
    })
    this.loadNewMessages(neededData, chatroom);
  }

   // LÄD DIE ANDEREN USERS AUßer DEN LOCAL USER
   loadOtherUsers(neededData, doc2) {
    const x2 = query(collection(this.db, "users"), where("uid", "==", doc2.id));
    const s2 = onSnapshot(x2, async (querySnapshot) => {
      querySnapshot.forEach(async (doc3: any) => {
          neededData.userID = doc3.data().uid
          neededData.userName = doc3.data().displayName;
          neededData.userIsOnline = doc3.data().isOnline;
          if(neededData.numberOfChatUsers > 2){
            neededData.userImg = '/assets/img/groupchat.png';
          }
          else{
          neededData.userImg = doc3.data().photoURL;
          }
      })
    })
  }

    // LOAD THE NEW MESSAGE FOR CHATROOM FROM LOCAL USER
    loadNewMessages(neededData, chatroom) {
      const x2 = query(collection(this.db, "chatrooms", chatroom.id, "users"), where("id", "==", this.localUser.uid));
      const s2 = onSnapshot(x2, async (querySnapshot) => {
        querySnapshot.forEach(async (doc4: any) => {
            neededData.newMessageforOtherUser = doc4.data().newMessage
        })
      })
    }

  // ÜBERPRÜFT DAUERHAFT OB DER CHATROOM IN DER SIDEBAR ANGEZEIGT WERDEN SOLL
  checkIfChatroomIsShownInSidebar(neededData, chatroomID) {
    const x3 = query(collection(this.db, "users", this.localUser.uid, "chatids",), where("id", "==", chatroomID));
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

  createChatAndCloseSidenav(){
    if(this.innerWidth < 645){
      this.sidenavService.closeSidenav();
    }
  }

  // SHOWS IN SIDEBAR WHICH CHANNEL IS ACTIVE
  showActive(value, positionInArray) {
    this.activeChatChannel = value;
    if(this.innerWidth < 645){
      this.sidenavService.closeSidenav();
    }
  }

  // SHOWS IN SIDEBAR WHICH CHANNEL IS ACTIVE 
  async showActiveChat(value, positionInArray) {
    this.activeChatChannel = value;
    const otherUserRef = doc(this.db, "chatrooms", this.chatrooms[positionInArray].chatroomID, "users", this.localUser.uid);
    await updateDoc(otherUserRef, {
      newMessage: 0,
    });
    if(this.innerWidth < 645){
      this.sidenavService.closeSidenav();
    }
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
