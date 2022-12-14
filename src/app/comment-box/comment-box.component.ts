import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection, QuillEditorComponent } from 'ngx-quill';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { limit } from '@angular/fire/firestore';
import 'quill-emoji/dist/quill-emoji.js';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { finalize, map, ObjectUnsubscribedError, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LightboxComponent } from '../lightbox/lightbox.component';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss']
})


export class CommentBoxComponent implements OnInit {

  form: FormGroup;
  db = getFirestore();
  data = {};
  text: string;

  PostRef: AngularFireStorageReference;
  PostTask: AngularFireUploadTask;
  PostUploadState: Observable<string>;

  CommentRef: AngularFireStorageReference;
  CommentTask: AngularFireUploadTask;
  CommentUploadState: Observable<string>;

  downloadURLPost: Observable<string>;
  downloadURLThread: Observable<string>;

  imgUploadThread = '';
  imgUploadPost = '';
  loading = false;
  valid = false;

  channelName = '';
  channelId: string;
  currentUser = [];

  innerWidth: number;

  @ViewChild('editor', {
    static: true
  }) editor: QuillEditorComponent

  @Input() location: string;
  @Input() CommentToPost: any;
  @Input() lightboxOpen = false;
  @Input() lightboxImg = '';

  @HostListener('window:resize', ['$event'])
  onResize() {
  this.innerWidth = window.innerWidth;
}


  modules = {
    'emoji-shortname': true,
    'emoji-textarea': false,
    'emoji-toolbar': true,
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['emoji']
    ],
  }

  modulesSmall = {
    'emoji-shortname': true,
    'emoji-textarea': false,
    'emoji-toolbar': true,
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['link'],
      ['emoji']
    ],
  }

  post = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
    channelId: '',
    upload: '',
    postId: '',
    channelName: ''
  }

  thread = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
    postId: '',
    channelId: '',
    upload: ''
  }

  localUser;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private afStorage: AngularFireStorage,
    private dialog: MatDialog) {
    this.form = new FormGroup({
      'editor': new FormControl()
    });
  }


  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
    this.innerWidth = window.innerWidth;
  }


  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    if (event['event'] == 'text-change') {
      this.text = event['html'];
      console.log(this.text);
      if (this.text == null) {
        this.valid = false;
      }
      else {
        this.valid = true;
      }
    }
  }


  postToChannel() {
    this.loading = true;
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
    })
    this.setData();
    // this.setThread();
  }


  setData() {
    if (this.location == 'posts') this.setPostData();
    if (this.location == 'comments') this.setCommentData();
  }


  async setPostData() {
      this.post.userId = this.currentUser['uid'];
      this.post.text = this.text? this.text : '';
      this.post.time = Timestamp.fromDate(new Date());
      this.post.channelId = this.channelId;
      this.post.upload = this.imgUploadPost;
      this.post.postId = Math.random().toString(36).substring(2);
      this.post.channelName = this.channelName;
      this.data = this.post;
      this.sendDataToPost();
  }


  setCommentData() {
    this.thread.userId = this.currentUser['uid'];
    this.thread.text = this.text? this.text : '';
    this.thread.time = Timestamp.fromDate(new Date());
    this.thread.postId = this.CommentToPost.postId;
    this.thread.channelId = this.CommentToPost.channelId;
    this.thread.upload = this.imgUploadThread;
    this.data = this.thread;
    this.sendDataToComments();
  }


  async sendDataToPost() {
    await setDoc(doc(this.db, "channels", this.channelId, "posts", this.post.postId), this.data);
    await this.setThreadInUser();
    this.form.reset();
    this.resetUploadPost();
  }


  async setThreadInUser() {
    await setDoc(doc(this.db, "users", this.localUser.uid, "threads", this.post.postId), { channelId: this.channelId, postId: this.post.postId, time: Timestamp.fromDate(new Date()) });
  }


  async sendDataToComments() {
    await addDoc(collection(this.db, "channels", this.CommentToPost.channelId, "posts", this.CommentToPost.postId, "comments"), this.data);
    await this.setThreadCommentInUser();
    this.form.reset();
    this.resetUploadThread();
  }


  async setThreadCommentInUser() {
    console.log(this.CommentToPost.postId)
    console.log(this.CommentToPost.channelId)
    await setDoc(doc(this.db, "users", this.localUser.uid, "threads", this.CommentToPost.postId), { channelId: this.CommentToPost.channelId, postId: this.CommentToPost.postId, time: Timestamp.fromDate(new Date()) });
  }


  setThread() {
    let ref = collection(this.db, "channels", this.channelId, "posts");
    let y = query(ref, orderBy("time"), limit(1));
    let unsubscribe = onSnapshot(y, (snapshot) => {
      snapshot.forEach((postDoc: any) => {
        // Get the existing data
        var existing = localStorage.getItem('user');
        // If no existing data, create an array
        // Otherwise, convert the localStorage string to an array
        existing = existing ? JSON.parse(existing) : {};
        this.firestore.collection('users').doc(existing['uid']).collection('threads').doc(this.channelId).set({ time: postDoc.data()['time'], channelId: this.channelId, postId: postDoc.id })
      });
      unsubscribe()
    });
  }


  uploadToPosts(event) {
    const randomId = Math.random().toString(36).substring(2);
    this.PostRef = this.afStorage.ref('/images/' + randomId);
    this.PostTask = this.PostRef.put(event.target.files[0]);
    this.PostTask.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURLPost = this.PostRef.getDownloadURL();
        this.downloadURLPost.subscribe(url => {
          if (url) {
            this.PostUploadState = null;
            this.imgUploadPost = url;
            this.valid = true;
          }
        });
      })
    )
      .subscribe()
  }


  uploadToThread(event) {
    const randomId = Math.random().toString(36).substring(2);
    this.CommentRef = this.afStorage.ref('/images/' + randomId);
    this.CommentTask = this.CommentRef.put(event.target.files[0]);
    this.CommentTask.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURLThread = this.CommentRef.getDownloadURL();
        this.downloadURLThread.subscribe(url => {
          if (url) {
            this.CommentUploadState = null;
            this.imgUploadThread = url;
            this.valid = true;
          }
        });
      })
    )
      .subscribe();
  }


  discardUploadPost() {
    this.imgUploadPost = '';
    this.PostRef.delete();
    this.resetUploadPost();
  }


  discardUploadThread(){
    this.imgUploadThread = '';
    this.CommentRef.delete();
    this.resetUploadThread();
  }


  resetUploadPost() {
    this.valid = false;
    this.loading = false;
    this.downloadURLPost = null;
    this.PostUploadState = null;
    this.PostRef = null;
    this.PostTask = null;
  }


  resetUploadThread(){
    this.valid = false;
    this.loading = false;
    this.downloadURLThread = null;
    this.CommentUploadState = null;
    this.CommentRef = null;
    this.CommentTask = null;
  }


  openLightbox(url) {
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

}
