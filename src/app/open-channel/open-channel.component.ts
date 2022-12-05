import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { getFirestore } from '@firebase/firestore';
import { collection, orderBy, onSnapshot, query, where } from "firebase/firestore";
import { MatDialog } from '@angular/material/dialog';
import { ChannelDetailsComponent } from '../channel-details/channel-details.component';


@Component({
  selector: 'app-open-channel',
  templateUrl: './open-channel.component.html',
  styleUrls: ['./open-channel.component.scss']
})
export class OpenChannelComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  
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
    private dialog: MatDialog,
    public router: Router
  ) { }


  ngOnInit(): void {
    this.posts = [];
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
      this.loadChannel();
      this.loadMessages();
    })
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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
    const loadedChatID = this.channelId;
    let unsubscribe = onSnapshot(q, async (snapshot) => {
      if (loadedChatID != this.channelId) {
        unsubscribe()
      }
      else {
        this.posts = [];
        snapshot.forEach((postDoc) => {
          let post = {
            text: postDoc.data()['text'],
            time: this.convertTimestamp(postDoc.data()['time']),
            author: '',
            img: '',
            postId: postDoc.id,
            userId: postDoc.data()['userId'],
            channelId: postDoc.data()['channelId']
          };
          this.loadAuthor(post);
        });
      }
    });
  }


  loadAuthor(post) {
    let user = query(collection(this.db, "users"), where("uid", "==", post.userId));
    let unsubscribe = onSnapshot(user, async (snapshot) => {
      snapshot.forEach((userDoc) => {
        post.author = userDoc.data()['displayName'];
        post.img = userDoc.data()['photoURL'];
      });
    });
    this.posts.push(post);
  }


  showChannelDetails(){
    let dialog = this.dialog.open(ChannelDetailsComponent);
    dialog.componentInstance.channel = new Channel(this.channel.toJSON());
    dialog.componentInstance.channelId = this.channelId;
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


  openComments(post) {
    this.thread = post;
    console.log('thread',this.thread)
  }


  trackByFn(item) {
    return item.id;
  }


  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

}
