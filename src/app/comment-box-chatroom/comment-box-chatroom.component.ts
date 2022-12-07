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

  @Input() otherUserID = '';

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

  bla = '';

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

  upload = (event) => {
    const randomId = Math.random().toString(36).substring(2);
    this.ref2 = this.afStorage.ref('/images/' + randomId);
    this.task2 = this.ref2.put(event.target.files[0]);
    console.log(event)
    console.log(this.task2)
    console.log(this.ref2)
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
            this.bla = url;
          }
          console.log(this.imageURL2)
        });
      })
    )
      .subscribe();
    this.uploadState2 = this.task2.snapshotChanges().pipe(map(s => s.state));

  }

  discardUpload() {
    this.bla = '';
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
    this.messageData.messageImg = this.bla;


    await addDoc(collection(this.db, "chatrooms", this.currentChatroomID, "messages"), this.messageData);
    this.setnewMessage();
    this.form.reset();
    this.resetUpload();
    this.bla = '';
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

  quillEditorRef: any;
  getEditorInstance(editorInstance: any) {
    // this.quillEditorRef = editorInstance;

    // console.log(editorInstance);

    // const toolbar = this.quillEditorRef.getModule('toolbar');
    // // toolbar.addHandler('image', this.imageHandler);
    // toolbar.addHandler('image', this.uploadImageHandler);
  }

  uploadImageHandler = () => {
    console.log("Root image handler", this.quillEditorRef);
    // const input = document.createElement('input');
    // input.setAttribute('type', 'file');
    // input.setAttribute('accept', 'image/*');
    // input.click();
    // input.onchange = async () => {
    //   const file = input.files?.length ? input.files[0] : null;

    //   console.log('User trying to uplaod this:', file);

    //   console.log("this.quillEditorRef", this.quillEditorRef);
    //   const range = this.quillEditorRef.getSelection();
    //   // const id = await 
    //   this.uploadFile(file).subscribe((res: any) => {
    //     if (res?.status) {
    //       this.quillEditorRef.insertEmbed(range.index, 'image', res?.image_url);
    //     }
    //   });
    // }
  }

  closeLightbox(){
    this.lightboxOpen = false;
  }

  openLightbox(url){
    this.lightboxOpen = true;
    this.lightboxImg = url;
  }

}
