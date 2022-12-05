import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { getFirestore } from '@firebase/firestore';
import { Firestore, CollectionReference, collectionData, docData, collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where, limit, limitToLast, getCountFromServer } from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { Channel } from 'src/models/channel.class';
import { fromEvent, timestamp } from 'rxjs';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent implements OnInit {
  testVar: any = "";
  db = getFirestore();
  channelId = '';
  channel: Channel = new Channel();
  posts = [];
  varTest = 'Hallo'
  allThreads = [];
  localUser;
  counter = 0;
  userId = '';

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private firestore: AngularFirestore, private router: Router, public fr: Firestore) { }

  async ngOnInit(): Promise<void> {
    await this.loadUser()
    await this.loadThreads();
  }

  async loadThreads() {
    let ref = collection(this.db, "users", this.userId, "threads");
    let y = query(ref, orderBy("time", "desc"));
    let unsubscribe = await onSnapshot(y, (snapshot) => {
      this.allThreads = [];
      this.counter = -1;
      snapshot.forEach((doc) => {
        this.counter++;
        this.channelId = doc.id;
        this.loadFirstMessage(this.counter);
        this.loadMessages(this.counter);
        this.loadChannelNames(this.counter)
        this.allThreads.push({ id: this.channelId, content: [] });
      });
      unsubscribe()
    });
  }

  loadUser() {
    // Get the existing data
    var existing = localStorage.getItem('user');
    // If no existing data, create an array
    // Otherwise, convert the localStorage string to an array
    existing = existing ? JSON.parse(existing) : {};
    this.userId = existing['uid'];
    // console.log('USER: ', existing['uid'])
  }

  loadChannelNames(counter) {
    this.firestore.collection(`channels`).doc(this.channelId).get().subscribe(async ref => {
      // const doc: any = ref.data();
      this.testVar = ref.data()
      this.allThreads[counter].channelName = this.testVar.channelName;
      // this.testArray.push({ channelName: this.testVar.channelName })
    });
  }

  // loadMessages(counter) {
  //     const visitArray = this.firestore.collection("channels").doc(this.channelId).collection("posts").snapshotChanges();
  //    visitArray.subscribe(payload => {
  //        this.totalVisitCount = payload.length;
  //        console.log('length:', this.totalVisitCount)
  //     if (this.totalVisitCount > 1) {
  //       let ref = collection(this.db, "channels", this.channelId, "posts");
  //       let q = query(ref, orderBy("time", "asc"), limitToLast(2));
  //       let unsubscribe = onSnapshot(q, (snapshot) => {
  //         this.allThreads[counter].content = []
  //         snapshot.forEach((postDoc) => {
  //           this.loadAuthor(postDoc, counter);
  //         });
  //         unsubscribe()
  //       });
  //     }
  //   });
  // }

  async loadMessages(counter) {
    let ref = collection(this.db, "channels", this.channelId, "posts");
    let q = query(ref, orderBy("time", "asc"), limitToLast(2));
    let unsubscribe = onSnapshot(q, async (snapshot) => {
      this.allThreads[counter].content = []
      await snapshot.forEach((postDoc) => {
        this.loadAuthor(postDoc, counter);
      });
      unsubscribe()
    });
  }

  async loadFirstMessage(counter) {
    let ref = collection(this.db, "channels", this.channelId, "posts");
    let y = query(ref, orderBy("time"), limit(1));
    let unsubscribe = await onSnapshot(y, (snapshot) => {
      this.allThreads[counter].content = []
      snapshot.forEach((postDoc) => {
        this.loadAuthor(postDoc, counter);
      });
      unsubscribe()
    });
  }

  async loadAuthor(postDoc, counter) {
    let user = query(collection(this.db, "users"), where("uid", "==", postDoc.data()['userId']));
    let querySnapshot = await getDocs(user);
    querySnapshot.forEach((userDoc) => {
      let post = {
        text: postDoc.data()['text'],
        time: this.convertTimestamp(postDoc.data()['time']),
        author: userDoc.data()['displayName'],
        img: userDoc.data()['photoURL'],
        id: postDoc.id
      };
      this.allThreads[counter].content.push(post);
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

}
