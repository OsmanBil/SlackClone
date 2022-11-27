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


  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['image'],
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
    this.data.userId = this.currentUser['uid'];
    this.data.text = this.text;
    this.data.time = Timestamp.fromDate(new Date());
    this.sendData();
  }


  async sendData() {
    await addDoc(collection(this.db, "channels", this.channelId, "posts"), this.data);
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
