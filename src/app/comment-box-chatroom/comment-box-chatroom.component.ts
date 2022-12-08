import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection, QuillEditorComponent } from 'ngx-quill';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";

import Quill from 'quill';
import { VideoHandler, ImageHandler, Options } from 'ngx-quill-upload';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { increment } from '@angular/fire/firestore';
import { LightboxComponent } from '../lightbox/lightbox.component';
import 'quill-emoji/dist/quill-emoji.js';



@Component({
  selector: 'app-comment-box-chatroom',
  templateUrl: './comment-box-chatroom.component.html',
  styleUrls: ['./comment-box-chatroom.component.scss']
})
export class CommentBoxChatroomComponent implements OnInit {

  

  form: FormGroup;
  db = getFirestore();

  ref2: AngularFireStorageReference;
  task2: AngularFireUploadTask;
  uploadProgress2: Observable<number>;
  uploadState2: Observable<string>;

  imageURL2: string;

  @Input() otherUserID: any[] = [];

  @ViewChild('editor', {
    static: true
  }) editor: QuillEditorComponent


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

  data = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
  }

  text: string = '';

  imageURL = '';

  channelId: string;
  currentUser = [];



  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),

    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
    messageAuthorID: '',
    messageImg: '',

  }
  localUser;
  currentChatroomID;
  downloadURL2!: Observable<string>;
  @Input() lightboxOpen = false;
  @Input() lightboxImg = '';


  constructor(
    private firestore: AngularFirestore,  private dialog: MatDialog,
    private afStorage2: AngularFireStorage, private route: ActivatedRoute) {
    this.form = new FormGroup({
      'editor': new FormControl()
    });
  }


  ngOnInit(): void {
    this.localUser = JSON.parse(localStorage.getItem('user'));
  }





  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    if (event['event'] == 'text-change') {
      this.text = event['html'];
    }
  }

  upload = (event) => {
    const randomId = Math.random().toString(36).substring(2);
    this.ref2 = this.afStorage2.ref('/images/' + randomId);
    this.task2 = this.ref2.put(event.target.files[0]);
    this.task2.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL2 = this.ref2.getDownloadURL();
        this.downloadURL2.subscribe(url => {
          if (url) {
            this.imageURL2 = url;
            this.uploadState2 = null;
            this.imageURL = url;
          }
          console.log(this.imageURL2)
        });
      })
    ).subscribe();


  }

  discardUpload() {
    this.imageURL = '';
      this.ref2.delete();
    this.resetUpload();
  }



  resetUpload() {
    this.downloadURL2 = null;
    this.uploadState2 = null;
    this.ref2 = null;
    this.task2 = null;
  }


  async addMessage() {
    this.route.paramMap.subscribe(paramMap => {
      this.currentChatroomID = paramMap.get('id');
    });
    this.messageData.messageText = this.text;
    this.messageData.messageServerTime = serverTimestamp(),
    this.messageData.messageAuthorID = this.localUser.uid;
    this.messageData.messageTime = Timestamp.fromDate(new Date());
    this.messageData.messageImg = this.imageURL;
    
    await addDoc(collection(this.db, "chatrooms", this.currentChatroomID, "messages"), this.messageData);

    this.setnewMessage();
    this.form.reset();
    this.resetUpload();
    this.imageURL = '';
  };


  async setnewMessage() {
    const otherUsersID = query(collection(this.db, "chatrooms", this.currentChatroomID, "users"), where('id', '!=', this.localUser.uid))
    const querySnapshotsUsersID = await getDocs(otherUsersID);
    querySnapshotsUsersID.forEach(async (doc: any) => {
      this.otherUserID.push(doc.id)
    });
    for(let i = 0; i < this.otherUserID.length; i++){
    const otherUserRef = doc(this.db, "chatrooms", this.currentChatroomID, "users", this.otherUserID[i]);
     await updateDoc(otherUserRef, {
       newMessage: 0,
     })   
    }
    const otherUserRef2 = doc(this.db, "chatrooms", this.currentChatroomID, "users", this.localUser.uid);
    await updateDoc(otherUserRef2, {
      newMessage: increment(1),
    });
  }

  
  

  openLightbox(url){
    let dialog = this.dialog.open(LightboxComponent);
    dialog.componentInstance.lightboxImg = url;
  
  }

}
