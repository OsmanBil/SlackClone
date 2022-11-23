import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";

@Component({
  selector: 'app-open-channel',
  templateUrl: './open-channel.component.html',
  styleUrls: ['./open-channel.component.scss']
})
export class OpenChannelComponent implements OnInit {

  db = getFirestore();
  channelId = '';
  channel: Channel = new Channel();
  posts = [];

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
      this.firestore
      .collection('channels')
      .doc(this.channelId)
      .valueChanges()
      .subscribe((channel: any) => {
        this.channel = new Channel(channel);
        this.loadMessages();
      })
    })
  }


  loadMessages() {
    const ref = collection(this.db, "channels", this.channelId, "posts");
    const q = query(ref, orderBy("time"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      this.posts = [];
      snapshot.forEach((doc) => {
        let post = { 
          text: doc.data()['text'], 
          time: this.convertTimestamp(doc.data()['time']), 
          author: doc.data()['author'], 
          img: doc.data()['img'],
          id: doc.id };
        this.posts.push(post);
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
    if (secondes.lenght < 10) {
      secondes = '0' + secondes
    }
    if (hours.lenght < 10) {
      hours = '0' + hours
    }
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    date = dd + '/' + (mm + 1) + '/' + yyyy + ' ' + hours + ':' + minutes;
    return date;
  }

}
