import { AfterViewChecked, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { getFirestore } from '@firebase/firestore';
import { collection, orderBy, onSnapshot, query, where } from "firebase/firestore";
import { MatDialog } from '@angular/material/dialog';
import { ChannelDetailsComponent } from '../channel-details/channel-details.component';
import { SearchService } from '../services/search.service';
import { LightboxComponent } from '../lightbox/lightbox.component';


@Component({
  selector: 'app-open-channel',
  templateUrl: './open-channel.component.html',
  styleUrls: ['./open-channel.component.scss']
})
export class OpenChannelComponent implements OnInit{

  
  db = getFirestore();
  channelId = '';
  channel: Channel = new Channel();
  privateChannel = [];
  posts = [];
  post: any;
  user = [];
  thread = [];

  searchText = '';
  
  @Input() lightboxOpen = false;
  @Input() lightboxImg = '';


  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private dialog: MatDialog,
    public router: Router,
    private search: SearchService
  ) {  }


  ngOnInit(): void {
    this.posts = [];
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
      this.loadChannel();
      this.loadPosts();
    })
    this.setSearchValue();
  }


  setSearchValue(){
    this.search.getData().subscribe(s => {                  
      this.searchText = s; 
    });
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


  loadPosts() {
    let postRef = collection(this.db, "channels", this.channelId, "posts");
    let q = query(postRef, orderBy("time"));
    const loadedChatID = this.channelId;
    let unsubscribe = onSnapshot(q, async (snapshot) => {
      if (loadedChatID != this.channelId) {
        unsubscribe()
      }
      else {
        this.startLoading(snapshot);
      }
    });
  }


  startLoading(snapshot){
    this.posts = [];
    snapshot.forEach((postDoc) => {
      let post = {
        text: postDoc.data()['text'],
        time: this.convertTimestamp(postDoc.data()['time']),
        author: '',
        img: '',
        postId: postDoc.id,
        userId: postDoc.data()['userId'],
        channelId: postDoc.data()['channelId'],
        uploadImg: postDoc.data()['upload']
      };
      this.loadAuthor(post);
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
  }


  openLightbox(url){
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }
}
