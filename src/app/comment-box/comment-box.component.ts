import { Component, Input, OnInit, ViewChild } from '@angular/core';
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

  refPost: AngularFireStorageReference;
  taskPost: AngularFireUploadTask;
  uploadProgressPost: Observable<number>;
  uploadStatePost: Observable<string>;
  imgUploadPost = '';
  downloadURLPost: Observable<string>;

  imageURL2: string;

  @ViewChild('editor', {
    static: true
  }) editor: QuillEditorComponent

  @Input() location: string;
  @Input() CommentToPost: any;
  @Input() lightboxOpen = false;
  @Input() lightboxImg = '';

  
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

  post = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
    channelId: '',
    upload: ''
  }

  thread = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
    postId: '',
    channelId: '',
    upload: ''
  }


  data = {};

  text: string;

  channelId: string;
  currentUser = [];

  constructor(
    private route: ActivatedRoute, 
    private firestore: AngularFirestore, 
    private afStorage: AngularFireStorage,
    private dialog: MatDialog) 
    {
    this.form = new FormGroup({
      'editor': new FormControl()
    });
  }


  ngOnInit(): void {
  }


  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    if (event['event'] == 'text-change') {
      this.text = event['html'];
    }
  }


  postToChannel() {
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
    })
    this.setData();
    this.setThread();
  }


  setData() {
    if (this.location == 'posts') {
      this.post.userId = this.currentUser['uid'];
      this.post.text = this.text;
      this.post.time = Timestamp.fromDate(new Date());
      this.post.channelId = this.channelId;
      this.post.upload = this.imgUploadPost;
      this.data = this.post;
      this.sendDataToPost();
    }

    if (this.location == 'comments') {
      this.thread.userId = this.currentUser['uid'];
      this.thread.text = this.text;
      this.thread.time = Timestamp.fromDate(new Date());
      this.thread.postId = this.CommentToPost.postId;
      this.thread.channelId = this.CommentToPost.channelId;
      // this.thread.upload = this.imgUpload;
      this.data = this.thread;
      this.sendDataToComments();
    }

  }


  async sendDataToPost() {
    await addDoc(collection(this.db, "channels", this.channelId, "posts"), this.data);
    this.form.reset();
    this.resetUpload();
  }


  async sendDataToComments() {
    await addDoc(collection(this.db, "channels", this.CommentToPost.channelId, "posts", this.CommentToPost.postId, "comments"), this.data);
    this.form.reset();
    this.resetUpload();
  }


  setThread() {
    let ref = collection(this.db, "channels", this.channelId, "posts");
    let y = query(ref, orderBy("time"), limit(1));
    let unsubscribe = onSnapshot(y, (snapshot) => {
      snapshot.forEach((postDoc) => {
        // Get the existing data
        var existing = localStorage.getItem('user');
        // If no existing data, create an array
        // Otherwise, convert the localStorage string to an array
        existing = existing ? JSON.parse(existing) : {};
        this.firestore.collection('users').doc(existing['uid']).collection('threads').doc(this.channelId).set({ time: postDoc.data()['time'] })
      });
      unsubscribe()
    });
  }


  uploadToPosts(event){
    const randomId = Math.random().toString(36).substring(2);
    this.refPost = this.afStorage.ref('/images/' + randomId);
    this.taskPost = this.refPost.put(event.target.files[0]);
    this.taskPost.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURLPost = this.refPost.getDownloadURL();
        this.downloadURLPost.subscribe(url => {
          if (url) {
            this.uploadStatePost = null;
            this.imgUploadPost = url;
          }
        });
      })
    )
    .subscribe();

  }


  discardUpload() {
    this.imgUploadPost = '';
    this.refPost.delete();
    this.resetUpload();
  }


  resetUpload() {
    this.downloadURLPost = null;
    this.uploadStatePost = null;
    this.refPost = null;
    this.taskPost = null;
  }


  openLightbox(url){
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

}
