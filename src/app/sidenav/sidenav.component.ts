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


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})


export class SidenavComponent implements OnInit {

  channels = [];
  versuchArray = [];

  channelOpen = true;
  messageOpen = true;

  db = getFirestore();
  chatrooms = [];
  localUser;

  bla = '';

  chatIDs = [];
  chatUserIDs = [];
  @Input() activeChatChannel;


  otherUserID = '';
  constructor(public dialog: MatDialog, private firestore: AngularFirestore, private router: Router, private route: ActivatedRoute) { }


  ngOnInit(): void {
    // this.loadChatrooms();
    this.versuch();
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



  async loadChatrooms() {
    this.localUser = JSON.parse(localStorage.getItem('user'))
    // LOAD USER FROM CHATROOM
    let docRef = collection(this.db, "users", this.localUser['uid'], "chatids");
    const unsubscribe = onSnapshot(docRef, async (querySnapshot) => {
      this.chatIDs = [];
      this.chatUserIDs = [];
      this.chatrooms = [];
      querySnapshot.forEach(async (doc) => {

        this.chatIDs.push(doc.id)

      })
      await this.loadChatIDs();
      await this.loadChatroomUserData();
      console.log(this.chatIDs[0])

      let docRef2 = collection(this.db, "chatrooms", this.chatIDs[1], "messages");

      const q = query(docRef2, orderBy("messageTime", "desc"), limit(1));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const cities = [];
        querySnapshot.forEach((doc: any) => {
          cities.push(doc.data().messageTime);
        });
        console.log("Current cities in CA: ", cities);
        const washingtonRef = doc(this.db, "chatrooms", this.chatIDs[1], "lastMessage", "lastMessage");

        // Set the "capital" field of the city 'DC'
        console.log(cities[0])
        // await updateDoc(washingtonRef, {
        //   authorID: this.localUser.uid,
        //   time: cities[0]
        // });

      });

    })
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
      })

  }

  versuch() {
    this.localUser = JSON.parse(localStorage.getItem('user'))
    let docRef = collection(this.db, "users", this.localUser['uid'], "chatids");
    const unsubscribe = onSnapshot(docRef, async (querySnapshot) => {
      this.versuchArray = [];
      querySnapshot.forEach(async (doc) => {
        let neededData = {
          chatroomID: '',
          userID: '',
          userImg: '',
          userIsOnline: '',
          userName: '',
          newMessageforOtherUser: '',
        }
        neededData.chatroomID = doc.id;

        const x1 = query(collection(this.db, "chatrooms", doc.id, "users"), where("id", "!=", this.localUser.uid));
        const s1 = onSnapshot(x1, async (querySnapshot) => {
        querySnapshot.forEach(async (doc2: any) => {
          for (let x = 0; x < this.versuchArray.length; x++) {
            if (this.versuchArray[x].userID == doc2.uid) {
              this.versuchArray[x].newMessageforOtherUser = doc2.data().newMessage}
              else {
                neededData.newMessageforOtherUser = doc2.data().newMessage
              }
          }
          const x2 = query(collection(this.db, "users"), where("uid", "==", doc2.id));
          const s2 = onSnapshot(x2, async (querySnapshot) => {
            querySnapshot.forEach(async (doc3: any) => {
              for (let x = 0; x < this.versuchArray.length; x++) {
                if (this.versuchArray[x].userID == doc3.data().uid) {
                  this.versuchArray[x].userID = doc3.data().uid
                  this.versuchArray[x].userImg = doc3.data().photoURL;
                  this.versuchArray[x].userName = doc3.data().displayName;
                  this.versuchArray[x].userIsOnline = doc3.data().isOnline;
                } else {
                  neededData.userID = doc3.data().uid
                  neededData.userImg = doc3.data().photoURL;
                  neededData.userName = doc3.data().displayName;
                  neededData.userIsOnline = doc3.data().isOnline;
                }
              }
            })
          })
          })
        })
        this.versuchArray.push(neededData);
        console.log(this.versuchArray)
      })

    })


  }
 
  async loadChatIDs() {
    this.chatUserIDs = [];
    for (let x = 0; x < this.chatIDs.length; x++) {
      let docRef2 = collection(this.db, "chatrooms", this.chatIDs[x], "users");
      let querySnapshot2 = await getDocs(docRef2);
      querySnapshot2.forEach(async (doc2: any) => {
        if (doc2.data().id !== this.localUser['uid']) {
          this.chatUserIDs.push({ userID: doc2.data().id, name: doc2.data().name, chatID: this.chatIDs[x] })
        }
      })
    }
  };

  async loadChatroomUserData() {
    this.chatrooms = [];
    for (let i = 0; i < this.chatUserIDs.length; i++) {
      const unsub = onSnapshot(doc(this.db, "users", this.chatUserIDs[i].userID), { includeMetadataChanges: true },
        (doc: any) => {
          let chatroomUser = {
            userID: doc.data().id, chatroomID: this.chatUserIDs[i].chatID, name: doc.data().displayName,
            isOnline: doc.data().isOnline, photoURL: doc.data().photoURL, localIndex: i
          }
          if (this.chatrooms.length == this.chatIDs.length) {
            this.chatrooms[chatroomUser.localIndex] = chatroomUser
          }
          else {
            this.chatrooms.push(chatroomUser)
          }
        })
    }

  }

  showActive(value) {
    this.activeChatChannel = value;
    console.log(value)
  }

  openChatroom(chatroomID) {
    this.router.navigateByUrl('/mainpage/chatroom/' + chatroomID);
  }
}
