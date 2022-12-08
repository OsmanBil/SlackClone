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

  refThread: AngularFireStorageReference;
  taskThread: AngularFireUploadTask;
  uploadProgressThread: Observable<number>;
  uploadStateThread: Observable<string>;
  downloadURLThread: Observable<string>;

  imgUploadThread = '';


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
      this.thread.upload = this.imgUploadThread;
      this.data = this.thread;
      this.sendDataToComments();
  }


  async sendDataToComments() {
    await addDoc(collection(this.db, "channels", this.CommentToPost.channelId, "posts", this.CommentToPost.postId, "comments"), this.data);
    this.form.reset();
    // this.resetUpload();
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


  uploadToThread(event){
    const randomId = Math.random().toString(36).substring(2);
    this.refThread = this.afStorage.ref('/images/' + randomId);
    this.taskThread = this.refThread.put(event.target.files[0]);
    this.taskThread.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURLThread = this.refThread.getDownloadURL();
        this.downloadURLThread.subscribe(url => {
          if (url) {
            this.uploadStateThread = null;
            this.imgUploadThread = url;
          }
        });
      })
    )
      .subscribe();
      this.uploadStateThread = this.taskThread.snapshotChanges().pipe(map(s => s.state));
  }


  discardUpload() {
    this.imgUploadThread = '';
    this.refThread.delete();
    this.resetUpload();
  }


  resetUpload() {
    this.downloadURLThread = null;
    this.uploadStateThread = null;
    this.refThread = null;
    this.taskThread = null;
  }


  openLightbox(url){
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  }

}
