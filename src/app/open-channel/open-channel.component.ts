import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { getCountFromServer, getFirestore } from '@firebase/firestore';
import { collection, orderBy, onSnapshot, query, where } from "firebase/firestore";
import { MatDialog } from '@angular/material/dialog';
import { ChannelDetailsComponent } from '../channel-details/channel-details.component';
import { SearchService } from '../services/search.service';
import { LightboxComponent } from '../lightbox/lightbox.component';
import { MatDrawer } from '@angular/material/sidenav';
import { SidenavToggleService } from '../services/sidenav-toggle.service';
import { MarkPostService } from '../services/mark-post.service';
import { collectionGroup } from '@angular/fire/firestore';

@Component({
  selector: 'app-open-channel',
  templateUrl: './open-channel.component.html',
  styleUrls: ['./open-channel.component.scss'],
  styles: [
    ` 
    .greenClass { background-color:  rgb(199, 197, 197) }
    `
  ]
})
export class OpenChannelComponent implements OnInit, AfterViewInit, AfterViewChecked{

  postIdFrom = this.markPostService.message1;

  db = getFirestore();
  channelId = '';
  channel: Channel = new Channel();
  privateChannel = [];
  posts = [];
  post: any;
  user = [];
  thread = [];

  searchText = '';
  scrollCounter = 0;
  innerWidth: any;
  innerHeight: number;
  panelOpenState = false;
  
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChild('threadContainer') public threadDrawer: MatDrawer;
  @Input() lightboxOpen = false;
  @Input() lightboxImg = '';

  @HostListener('window:resize', ['$event'])
  onResize() {
  this.innerWidth = window.innerWidth;
  this.innerHeight = window.innerHeight;
}

  sendedPostID = '';

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private dialog: MatDialog,
    public router: Router,
    private search: SearchService,
    public sidenavService: SidenavToggleService,
    public markPostService: MarkPostService
  ) {  }


  ngOnInit(): void {
    this.posts = [];
    this.route.queryParams.subscribe(
      params => {
        this.sendedPostID =  params['sendedPostID'];
      }
    )
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
      this.loadChannel();
      this.loadPosts();
    })
    this.setSearchValue();
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }


  ngAfterViewInit(): void {
    this.sidenavService.setThread(this.threadDrawer);
  }


  ngAfterViewChecked() {
    if(this.scrollCounter == 0) {
      if(this.sendedPostID.length == 0){
        this.scrollToBottom();
      } else {
        setTimeout(() => { this.scrollToPost() }, 500);
      }
     
       this.scrollCounter++
     } 
  }

  scrollToPost(){
    document.getElementById(this.sendedPostID).scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }


  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
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
    const loadedID = this.channelId;
    let unsubscribe = onSnapshot(q, async (snapshot) => {
      if (loadedID != this.channelId) {
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
        uploadImg: postDoc.data()['upload'],
        commentSize: '',
      };
      this.loadComments(post);
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
    this.scrollCounter = 0
  }


  async loadComments(post){
    let commentRef = collection(this.db, "channels", post.channelId, "posts", post.postId, 'comments');
    let snapshot = await getCountFromServer(commentRef);
    post.commentSize = snapshot.data().count;
    this.loadAuthor(post);
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
    if(this.innerWidth < 910){
      this.sidenavService.openThread();
    }
    else{
      this.threadDrawer.open();
    }
  }


  openLightbox(url){
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

  closeThreads(){
    this.threadDrawer.close();
  }
}
