import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getFirestore } from '@firebase/firestore';
import { collection, getDocs, orderBy, onSnapshot, query, where } from "firebase/firestore";
import { LightboxComponent } from '../lightbox/lightbox.component';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnChanges {

  @Input() post: any;


  db = getFirestore();
  comments = [];
  
  @Input() lightboxImg = '';

  constructor(private dialog: MatDialog) { }


  ngOnChanges() {
    if (this.post.length == 0) {
      //don't load Comments because Id's are not defined
    }
    else {
      this.comments = [];
      this.loadComments();
    }
  }


  loadComments() {
    let commentRef = collection(this.db, "channels", this.post.channelId, "posts", this.post.postId, 'comments');
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


  openLightbox(url){
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

}
