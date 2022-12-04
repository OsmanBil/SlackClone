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
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { increment } from '@angular/fire/firestore';

Quill.register('modules/imageHandler', ImageHandler);
Quill.register('modules/videoHandler', VideoHandler);

@Component({
  selector: 'app-comment-box-chatroom',
  templateUrl: './comment-box-chatroom.component.html',
  styleUrls: ['./comment-box-chatroom.component.scss']
})
export class CommentBoxChatroomComponent implements OnInit {


  form: FormGroup;
  db = getFirestore();

  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadProgress: Observable<number>;
  uploadState: Observable<string>;
  downloadURL: Observable<string>;
  imageURL: string;

  @Input() otherUserID = '';

  @ViewChild('editor', {
    static: true
  }) editor: QuillEditorComponent


  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['image', 'video'],
    ],


  }

  data = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
  }

  text: string;

  channelId: string;
  currentUser = [];



  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),
    // messageAuthor: 'server',
    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
    messageAuthorID: '',

  }
  localUser;
  currentChatroomID;

  constructor(
    private firestore: AngularFirestore,
    private afStorage: AngularFireStorage, private route: ActivatedRoute) {
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



  async addMessage() {
    this.route.paramMap.subscribe(paramMap => {
      this.currentChatroomID = paramMap.get('id');
    });
    this.messageData.messageText = this.text;
    this.messageData.messageServerTime = serverTimestamp(),
      this.messageData.messageAuthorID = this.localUser.uid;
    this.messageData.messageTime = Timestamp.fromDate(new Date());

    await addDoc(collection(this.db, "chatrooms", this.currentChatroomID, "messages"), this.messageData);
    this.setnewMessage();
    this.form.reset();
  };


  async setnewMessage() {
    const otherUserRef = doc(this.db, "chatrooms", this.currentChatroomID, "users", this.otherUserID);
    await updateDoc(otherUserRef, {
      newMessage: 0,
    });
    const otherUserRef2 = doc(this.db, "chatrooms", this.currentChatroomID, "users", this.localUser.uid);
    await updateDoc(otherUserRef2, {
      newMessage: increment(1),
    });
  }
}
