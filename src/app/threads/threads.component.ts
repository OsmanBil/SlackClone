import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { getFirestore } from '@firebase/firestore';

import { Firestore, CollectionReference, collectionData, docData, collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';

import * as firebase from "firebase/app";
import 'firebase/firestore';
import { Channel } from 'src/models/channel.class';


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
  allThreads = [];


  constructor(private route: ActivatedRoute, public dialog: MatDialog, private firestore: AngularFirestore, private router: Router, public fr: Firestore) { }

  async ngOnInit(): Promise<void> {
    await this.loadThreads();

  }





  async loadThreads() {
    let querySnapshot = await getDocs(collection(this.fr, "users/Crq65CZbkqVw2UOOCitlq2zCbyD2/threads"));
    querySnapshot.forEach(async (doc) => {
      // console.log(doc.id)
      this.channelId = doc.id;
      // console.log("channelId:", this.channelId)
      this.allThreads.push(this.channelId);
      await this.loadChannel(this.channelId)
      

    })

    console.log("allThreads:",  this.allThreads)
  }

  async loadChannel(test) {
    this.firestore
      .collection('channels')
      .doc(test)
      .valueChanges()
      .subscribe((channel: any) => {
        test = new Channel(channel);
        this.loadMessages();
      })

  }


  loadMessages() {
    let ref = collection(this.db, "channels", this.channelId, "posts");
    let q = query(ref, orderBy("time"));
    let unsubscribe = onSnapshot(q, (snapshot) => {
      this.posts = [];
      snapshot.forEach((postDoc) => {
        this.loadAuthor(postDoc);
      });
    });
  }


  async loadAuthor(postDoc) {
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
      this.posts.push(post);
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
