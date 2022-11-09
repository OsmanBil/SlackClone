import { Component, OnInit } from '@angular/core';
import { Chatroom } from 'src/models/chatrooms.class';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-dialog-create-chat',
  templateUrl: './dialog-create-chat.component.html',
  styleUrls: ['./dialog-create-chat.component.scss']
})
export class DialogCreateChatComponent implements OnInit {
  // loading = false;
  // isChecked = true;

  // chatroom = new Chatroom();

  constructor() { }


  ngOnInit(): void {
  }

  // save(){
  //   this.loading = true;

  //   this.firestore
  //   .collection('chatrooms')
  //   .add(this.chatroom.toJSON());

  //   this.loading = false;
  //   this.dialogRef.close();
  // }

}
