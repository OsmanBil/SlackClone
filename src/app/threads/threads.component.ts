import { Component, Input, OnInit } from '@angular/core';
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
import { LightboxComponent } from '../lightbox/lightbox.component';
import { async } from '@angular/core/testing';
import { MarkPostService } from '../services/mark-post.service';
import { SearchService } from '../services/search.service';


@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent implements OnInit {


  channelId = 'Ay2zQKNVkwbRUDWOyqXC';
  postId = 'iPCGASHA62U7wMwI4D8J'

  threadName = '';
  channelName = '';


  allThreads = [];
  thread = [];
  searchText = '';

  db = getFirestore();
  comments = [];

  localUser;
  ALLTHREADS: any[] = [];

  constructor(private search: SearchService, public markPostService: MarkPostService, private route: ActivatedRoute, public dialog: MatDialog, private firestore: AngularFirestore, private router: Router, public fr: Firestore) { }

  async ngOnInit(): Promise<void> {
   
    this.localUser = JSON.parse(localStorage.getItem('user'));
    // await  this.loadAll()
    this.loadAllThreads();
 this.setSearchValue();
  }

  async loadAll() {

    await this.loadComments();
    this.loadThread()



  }

  setSearchValue(){
    this.search.getData().subscribe(s => {                  
      this.searchText = s; 
    });
  }

  setMarkedPostId(id: string){
    this.markPostService.message1 = id
    console.log(id)
  }

  async loadAllThreads() {
    const userThreads = query(collection(this.db, 'users', this.localUser.uid, 'threads'), orderBy("time"));
    const userThreadsDocs = await getDocs(userThreads);
    userThreadsDocs.forEach(async (onethread: any) => {


      let threadData = {
        channelID: '',
        channelName: this.channelName,
        postID: '',
        time: Timestamp,
        postAuthorID: '',
        postAuthorImg: '',
        postAuthorName: '',
        postTime: Timestamp,
        postText: '',
        postUpload: '',
        lastTwoComment: [],
        uploadImg: ''
      }

      threadData.channelID = onethread.data().channelId,
        threadData.postID = onethread.data().postId
      // threadData.time = this.convertTimestamp(onethread.data().time);
      // threadData.postTime = this.convertTimestamp(onethread.data().postTime);


      //Hier Funktion zum Abrufen für den Channelnamen
      const docRef = doc(this.db, "channels", threadData.channelID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.channelName = docSnap.data()['channelName'];
        threadData.channelName = this.channelName;
      }
      //Ende der Funktion

      const authorRef = query(collection(this.db, 'channels', threadData.channelID, 'posts'), where('postId', '==', threadData.postID));
      const authorDocs = await getDocs(authorRef);
      authorDocs.forEach(async (author: any) => {
        threadData.postAuthorID = author.data().userId;
        threadData.postTime = this.convertTimestamp(author.data().time);
        threadData.postText = author.data().text;
        threadData.postUpload = author.data().upload;
        threadData.uploadImg = author.data().upload;

      })

      const authorUserRef = query(collection(this.db, 'users'), where('uid', '==', threadData.postAuthorID));
      const authorUserDocs = await getDocs(authorUserRef);
      authorUserDocs.forEach(async (authorData: any) => {
        threadData.postAuthorImg = authorData.data().photoURL;
        threadData.postAuthorName = authorData.data().displayName;

      })

      const commentRef = query(collection(this.db, 'channels', threadData.channelID, 'posts', threadData.postID, 'comments'), orderBy('time', 'desc'), limit(2));
      const commentDocs = await getDocs(commentRef);
      commentDocs.forEach(async (comment: any) => {
        let commendData = {
          commentLastAuthorID: '',
          commentLastAuthorImg: '',
          commentLastAuthorName: '',
          commentLastTime: '',
          commentLastText: '',
          commentLastUpload: '',
        }
        commendData.commentLastAuthorID = comment.data().userId;
        commendData.commentLastText = comment.data().text;



        commendData.commentLastTime = this.convertTimestamp(comment.data().time);
        commendData.commentLastUpload = comment.data().upload;

        const commentAuthorRef = query(collection(this.db, 'users'), where('uid', '==', commendData.commentLastAuthorID));
        const commentAuthorDocs = await getDocs(commentAuthorRef);
        commentAuthorDocs.forEach(async (commentAuthorData: any) => {
          commendData.commentLastAuthorImg = commentAuthorData.data().photoURL;
          commendData.commentLastAuthorName = commentAuthorData.data().displayName;
        })
        threadData.lastTwoComment.push(commendData)
      })

      this.ALLTHREADS.push(threadData)
    });

    //console.log(this.ALLTHREADS)
  }



  openComments(post) {
    this.thread = post;
  }















  loadThread() {
    this.firestore.collection(`channels`).doc(this.channelId).collection('posts').doc(this.postId).get().subscribe(async ref => {
      const doc: any = ref.data();
      // console.log('Thread:', doc)
      this.threadName = doc.text;

      //this.allThreads.push({id: this.channelId, threadName: doc['text']})

    });

    // this.firestore.collection(`channels`).doc(this.channelId).collection('posts').doc(this.postId).collection('comments').doc('gImJhZUpxI8yBUEJHR3N').get().subscribe(async ref => {
    //   const doc: any = ref.data();
    //   console.log('Thread:', doc)
    // });
    this.loadChannelNames()
  }

  loadChannelNames() {

    this.firestore.collection(`channels`).doc(this.channelId).get().subscribe(async ref => {
      const doc: any = ref.data();
      // console.log('Channel Name: #',  doc.channelName)
      this.channelName = doc.channelName
      this.allThreads.push({ id: this.channelId, threadName: this.threadName, channelName: doc.channelName, comments: this.comments })

    });

    console.log('allThreads:', this.allThreads)
  }



  async loadComments() {
    let commentRef = collection(this.db, "channels", this.channelId, "posts", this.postId, 'comments');

    let q = query(commentRef, orderBy("time"));
    let unsubscribe = onSnapshot(q, async (snapshot) => {
      this.comments = [];
      snapshot.forEach((commentDoc) => {
        let comment = {
          text: commentDoc.data()['text'],
          time: this.convertTimestamp(commentDoc.data()['time']),
          author: '',
          img: '',
          commentId: commentDoc.id,
          userId: commentDoc.data()['userId'],
          uploadImg: commentDoc.data()['upload']
        };
        this.loadAuthor(comment);
      });
    });
  }

  async loadAuthor(comment) {
    let user = query(collection(this.db, "users"), where("uid", "==", comment.userId));
    let unsubscribe = onSnapshot(user, async (snapshot) => {
      snapshot.forEach((userDoc) => {
        comment.author = userDoc.data()['displayName'];
        comment.img = userDoc.data()['photoURL'];
      });
    });
    this.comments.push(comment);

    console.log('Comments:', this.comments)
    unsubscribe()
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



  openLightbox(url) {
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

  // import { Component, OnInit } from '@angular/core';
  // import { AngularFirestore } from '@angular/fire/compat/firestore';
  // import { MatDialog } from '@angular/material/dialog';
  // import { ActivatedRoute, Router } from '@angular/router';
  // import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
  // import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
  // import { AngularFireDatabase } from '@angular/fire/compat/database';
  // import { getFirestore } from '@firebase/firestore';
  // import { Firestore, CollectionReference, collectionData, docData, collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where, limit, limitToLast, getCountFromServer } from '@angular/fire/firestore';
  // import { user } from '@angular/fire/auth';
  // import * as firebase from "firebase/app";
  // import 'firebase/firestore';
  // import { Channel } from 'src/models/channel.class';
  // import { fromEvent, timestamp } from 'rxjs';

  // @Component({
  //   selector: 'app-threads',
  //   templateUrl: './threads.component.html',
  //   styleUrls: ['./threads.component.scss']
  // })
  // export class ThreadsComponent implements OnInit {
  //   testVar: any = "";
  //   db = getFirestore();
  //   channelId = '';
  //   channel: Channel = new Channel();
  //   posts = [];
  //   varTest = 'Hallo'
  //   allThreads = [];
  //   localUser;
  //   counter = 0;
  //   userId = '';

  //   constructor(private route: ActivatedRoute, public dialog: MatDialog, private firestore: AngularFirestore, private router: Router, public fr: Firestore) { }

  //   async ngOnInit(): Promise<void> {
  //     await this.loadUser()
  //     await this.loadThreads();
  //   }

  //   async loadThreads() {
  //     let ref = collection(this.db, "users", this.userId, "threads");
  //     let y = query(ref, orderBy("time", "desc"));
  //     let unsubscribe = await onSnapshot(y, (snapshot) => {
  //       this.allThreads = [];
  //       this.counter = -1;
  //       snapshot.forEach((doc) => {
  //         this.counter++;
  //         this.channelId = doc.id;
  //         this.loadFirstMessage(this.counter);
  //         this.loadMessages(this.counter);
  //         this.loadChannelNames(this.counter)
  //         this.allThreads.push({ id: this.channelId, content: [] });
  //       });
  //       unsubscribe()
  //     });
  //   }

  //   loadUser() {
  //     // Get the existing data
  //     var existing = localStorage.getItem('user');
  //     // If no existing data, create an array
  //     // Otherwise, convert the localStorage string to an array
  //     existing = existing ? JSON.parse(existing) : {};
  //     this.userId = existing['uid'];
  //     // console.log('USER: ', existing['uid'])
  //   }

  //   loadChannelNames(counter) {
  //     this.firestore.collection(`channels`).doc(this.channelId).get().subscribe(async ref => {
  //       // const doc: any = ref.data();
  //       this.testVar = ref.data()
  //       this.allThreads[counter].channelName = this.testVar.channelName;
  //       // this.testArray.push({ channelName: this.testVar.channelName })
  //     });
  //   }

  //   // loadMessages(counter) {
  //   //     const visitArray = this.firestore.collection("channels").doc(this.channelId).collection("posts").snapshotChanges();
  //   //    visitArray.subscribe(payload => {
  //   //        this.totalVisitCount = payload.length;
  //   //        console.log('length:', this.totalVisitCount)
  //   //     if (this.totalVisitCount > 1) {
  //   //       let ref = collection(this.db, "channels", this.channelId, "posts");
  //   //       let q = query(ref, orderBy("time", "asc"), limitToLast(2));
  //   //       let unsubscribe = onSnapshot(q, (snapshot) => {
  //   //         this.allThreads[counter].content = []
  //   //         snapshot.forEach((postDoc) => {
  //   //           this.loadAuthor(postDoc, counter);
  //   //         });
  //   //         unsubscribe()
  //   //       });
  //   //     }
  //   //   });
  //   // }

  //   async loadMessages(counter) {
  //     let ref = collection(this.db, "channels", this.channelId, "posts");
  //     let q = query(ref, orderBy("time", "asc"), limitToLast(2));
  //     let unsubscribe = onSnapshot(q, async (snapshot) => {
  //       this.allThreads[counter].content = []
  //       await snapshot.forEach((postDoc) => {
  //         this.loadAuthor(postDoc, counter);
  //       });
  //       unsubscribe()
  //     });
  //   }

  //   async loadFirstMessage(counter) {
  //     let ref = collection(this.db, "channels", this.channelId, "posts");
  //     let y = query(ref, orderBy("time"), limit(1));
  //     let unsubscribe = await onSnapshot(y, (snapshot) => {
  //       this.allThreads[counter].content = []
  //       snapshot.forEach((postDoc) => {
  //         this.loadAuthor(postDoc, counter);
  //       });
  //       unsubscribe()
  //     });
  //   }

  //   async loadAuthor(postDoc, counter) {
  //     let user = query(collection(this.db, "users"), where("uid", "==", postDoc.data()['userId']));
  //     let querySnapshot = await getDocs(user);
  //     querySnapshot.forEach((userDoc) => {
  //       let post = {
  //         text: postDoc.data()['text'],
  //         time: this.convertTimestamp(postDoc.data()['time']),
  //         author: userDoc.data()['displayName'],
  //         img: userDoc.data()['photoURL'],
  //         id: postDoc.id
  //       };
  //       this.allThreads[counter].content.push(post);
  //     });
  //   }


  //   convertTimestamp(timestamp) {
  //     let date = timestamp.toDate();
  //     let mm = date.getMonth();
  //     let dd = date.getDate();
  //     let yyyy = date.getFullYear();
  //     let hours = date.getHours();
  //     let minutes = date.getMinutes();
  //     let secondes = date.getSeconds();
  //     if (secondes < 10) {
  //       secondes = '0' + secondes
  //     }
  //     if (hours < 10) {
  //       hours = '0' + hours
  //     }
  //     if (minutes < 10) {
  //       minutes = '0' + minutes
  //     }
  //     date = dd + '/' + (mm + 1) + '/' + yyyy + ' ' + hours + ':' + minutes;
  //     return date;
  //   }

  // }



}
