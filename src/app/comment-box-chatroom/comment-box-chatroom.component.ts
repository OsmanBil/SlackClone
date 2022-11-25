import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection, QuillEditorComponent } from 'ngx-quill';
import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";


@Component({
  selector: 'app-comment-box-chatroom',
  templateUrl: './comment-box-chatroom.component.html',
  styleUrls: ['./comment-box-chatroom.component.scss']
})
export class CommentBoxChatroomComponent implements OnInit {


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



  messageData = {
    messageText: 'This conversation is just between you and your choosen user. Here you can send messages and share files.',
    messageServerTime: serverTimestamp(),
    messageAuthor: 'server',
    messageTime: Timestamp.fromDate(new Date()),
    messageAuthorImg: '',
    messageAuthorID: '',

  }
  localUser;
  currentChatroomID;

  constructor(private route: ActivatedRoute) {
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
    const unsub = onSnapshot(doc(this.db, "users", this.localUser.uid), async (doc: any) => {
      this.messageData.messageText = this.text;
      this.messageData.messageServerTime = serverTimestamp(),
        this.messageData.messageAuthor = doc.data().displayName;
      this.messageData.messageAuthorID = this.localUser.uid;
      this.messageData.messageTime = Timestamp.fromDate(new Date());
      this.messageData.messageAuthorImg = doc.data().photoURL;

      this.route.paramMap.subscribe(paramMap => {
        this.currentChatroomID = paramMap.get('id');
      })

      await addDoc(collection(this.db, "chatrooms", this.currentChatroomID, "messages"), this.messageData);
      this.form.reset();
    });
  }

  // postToChannel(){
  //   this.currentUser = JSON.parse(localStorage.getItem('user'));
  //   this.route.paramMap.subscribe(paramMap => {
  //     this.channelId = paramMap.get('id');
  //   })
  //   this.setData();
  // }


  // setData(){
  //   this.data.userId = this.currentUser['uid'];
  //   this.data.text = this.text;
  //   this.data.time = Timestamp.fromDate(new Date());
  //   this.sendData();
  // }


  // async sendData(){
  //   await addDoc(collection(this.db, "channels", this.channelId, "posts"), this.data);
  // }
}
