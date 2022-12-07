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
import { finalize, map, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LightboxComponent } from '../lightbox/lightbox.component';

@Component({
  selector: 'app-comment-box-thread',
  templateUrl: './comment-box-thread.component.html',
  styleUrls: ['./comment-box-thread.component.scss']
})
export class CommentBoxThreadComponent implements OnInit {

  form: FormGroup;
  db = getFirestore();

  ref2: AngularFireStorageReference;
  task2: AngularFireUploadTask;
  uploadProgress2: Observable<number>;
  uploadState2: Observable<string>;
  imgUpload = '';
  downloadURL2!: Observable<string>;

  imageURL2: string;

  @ViewChild('editor', {
    static: true
  }) editor: QuillEditorComponent


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
      this.thread.userId = this.currentUser['uid'];
      this.thread.text = this.text;
      this.thread.time = Timestamp.fromDate(new Date());
      this.thread.postId = this.CommentToPost.postId;
      this.thread.channelId = this.CommentToPost.channelId;
      this.thread.upload = this.imgUpload;
      this.data = this.thread;
      this.sendDataToComments();
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


  upload = (event) => {
    const randomId = Math.random().toString(36).substring(2);
    this.ref2 = this.afStorage.ref('/images/' + randomId);
    this.task2 = this.ref2.put(event.target.files[0]);
    // observe upload progress
    this.uploadProgress2 = this.task2.percentageChanges();
    // get notified when the download URL is available
    this.task2.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL2 = this.ref2.getDownloadURL();
        this.downloadURL2.subscribe(url => {
          if (url) {
            this.imageURL2 = url;
            this.uploadState2 = null;
            this.imgUpload = url;
          }
        });
      })
    )
      .subscribe();
    this.uploadState2 = this.task2.snapshotChanges().pipe(map(s => s.state));

  }


  discardUpload() {
    this.imgUpload = '';
      this.ref2.delete();
    this.resetUpload();
  }


  resetUpload() {
    this.downloadURL2 = null;
    this.uploadState2 = null;
    this.ref2 = null;
    this.task2 = null;
  }


  openLightbox(url){
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

}
