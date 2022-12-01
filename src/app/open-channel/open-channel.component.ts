import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { Observable } from 'rxjs';


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
  post: any;
  user = [];
  thread = [];
  

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
  ) { }


  ngOnInit(): void {
    this.posts = [];
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
      this.loadChannel();
      this.loadMessages();
    })
  }


  loadChannel() {
    this.firestore
      .collection('channels')
      .doc(this.channelId)
      .valueChanges()
      .subscribe((channel: any) => {
        this.channel = new Channel(channel);
      })
  }


  loadMessages() {
    let postRef = collection(this.db, "channels", this.channelId, "posts");
    let q = query(postRef, orderBy("time"));
    let unsubscribe = onSnapshot(q, (snapshot) => {
      this.posts = [];
      snapshot.forEach(async (postDoc) => {
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
        id: postDoc.id,
        channelId: postDoc.data()['channelId']
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


  openComments(post){
    this.thread = post;
  }


  trackByFn(item) {
    return item.id;
  }

}
