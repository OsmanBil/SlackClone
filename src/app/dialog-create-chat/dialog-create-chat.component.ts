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
  messages = [
    {
      date: 'Yesterday',
      day_message: { 
        user: 'Oda Schneider',
        user_src: 'assets/img/p23.jpg',
        user_firstname: 'Oda:',
        user_message: 'ah ok alles klar 😄', 
      },
      },
      {
        date: 'Monday, November 7th',
        day_message: { 
          user: 'Osman Bilgin',
          user_src: 'assets/img/p24.jpg',
          user_firstname: 'Osman:',
          user_message: '😂😂😂 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam non rem similique? A totam amet optio ipsam quod. Quaerat quasi similique autem corporis nostrum tempora doloribus officiis neque molestiae eveniet?', 
        },
        },
        {
          date: 'Sunday, November 6th',
          day_message: { 
            user: 'Fabian Kalus',
            user_src: 'assets/img/p25.jpg',
            user_firstname: 'Fabian:',
            user_message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. 👌 Totam non rem similique? A totam amet optio ipsam quod. Quaerat quasi similique autem corporis nostrum tempora doloribus officiis neque molestiae eveniet?', 
          },
          },
  ]



  // loading = false;
  // isChecked = true;

  chatroom = new Chatroom();

constructor(private firestore: AngularFirestore) { }
  ngOnInit(): void {
  }

  save(){
  
 this.firestore
   .collection('chatrooms')
   .add(this.chatroom.toJSON());

    
 }

}
