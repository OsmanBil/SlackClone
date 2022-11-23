import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection, QuillEditorComponent } from 'ngx-quill';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";

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
    author: '',
    userId: '',
    img: ''
  }

  text: string;

  channelId: string;
  currentUser = [];

  constructor(private route: ActivatedRoute) {
    this.form = new FormGroup({
      'editor': new FormControl()
    });
  }


  ngOnInit(): void {
  }


  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    if(event['event']== 'text-change'){
      this.text = event['html'];
    }
  }


  postToChannel(){
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.route.paramMap.subscribe(paramMap => {
      this.channelId = paramMap.get('id');
    })
    this.setData();
  }


  setData(){
    this.data.author = this.currentUser['displayName'];
    this.data.userId = this.currentUser['uid'];
    this.data.img = this.currentUser['photoURL'];
    this.data.text = this.text;
    this.data.time = Timestamp.fromDate(new Date());
    this.sendData();
  }


  async sendData(){
    await addDoc(collection(this.db, "channels", this.channelId, "posts"), this.data);
  }
}
