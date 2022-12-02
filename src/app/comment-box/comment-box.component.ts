import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection, QuillEditorComponent } from 'ngx-quill';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss']
})


export class CommentBoxComponent implements OnInit {

  form: FormGroup;
  db = getFirestore();

  @ViewChild('editor', {
    static: true
  }) editor: QuillEditorComponent

  @Input() location: string;
  @Input() CommentToPost: any;

  
  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['image'],
    ],
  }

  post = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
    channelId: '',
  }

  thread = {
    text: '',
    time: Timestamp.fromDate(new Date()),
    userId: '',
    postId: '',
    channelId: ''
  }


  data = {};

  text: string;

  channelId: string;
  currentUser = [];

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore) {
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
    if(this.location == 'posts'){
      this.post.userId = this.currentUser['uid'];
      this.post.text = this.text;
      this.post.time = Timestamp.fromDate(new Date());
      this.post.channelId = this.channelId;
      this.data = this.post;
      this.sendDataToPost();
    }

    if(this.location == 'comments'){
      this.thread.userId = this.currentUser['uid'];
      this.thread.text = this.text;
      this.thread.time = Timestamp.fromDate(new Date());
      this.thread.postId = this.CommentToPost.postId;
      this.thread.channelId = this.CommentToPost.channelId;
      this.data = this.thread;
      this.sendDataToComments();
    }

  }


  async sendDataToPost() {
    await addDoc(collection(this.db, "channels", this.channelId, "posts"), this.data);
    this.form.reset();
  }


  async sendDataToComments(){
    await addDoc(collection(this.db, "channels", this.CommentToPost.channelId, "posts", this.CommentToPost.postId, "comments"), this.data);
    this.form.reset();
  }


  setThread() {
    // Get the existing data
    var existing = localStorage.getItem('user');
    // If no existing data, create an array
    // Otherwise, convert the localStorage string to an array
    existing = existing ? JSON.parse(existing) : {};
    this.firestore.collection('users').doc(existing['uid']).collection('threads').doc(this.channelId).set({})
  }

}
