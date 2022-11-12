import { Component, OnInit } from '@angular/core';
import { Chatroom } from 'src/models/chatrooms.class';
import { Message } from 'src/models/message.class';
import { chatroomUser } from 'src/models/chatroomUser.class';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, CollectionReference, collectionData, collection, setDoc, doc, addDoc, docData, onSnapshot } from '@angular/fire/firestore';
import { map } from '@firebase/util';


@Component({
  selector: 'app-dialog-create-chat',
  templateUrl: './dialog-create-chat.component.html',
  styleUrls: ['./dialog-create-chat.component.scss']
})
export class DialogCreateChatComponent implements OnInit {
  messagesExample = [
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

  chatroomUsers = {user: '', lastLogin: ''};
  chatroomMessages = {message: '', time: '', author: ''};
 
  chatroom = 
    {usersss: this.chatroomUsers,
    chatsss: []
  };

chatID: any;
chatListener: [];


constructor(private firestore: AngularFirestore) { }
  ngOnInit(): void {
   console.log(this.chatroom)

   this.chatListener = [];
  }

  
  save(){ 


    var arr = this.chatroom;
    var arrayToString = JSON.stringify(Object.assign({}, arr));  // convert array to string
    let dishesInChart = JSON.parse(arrayToString); //Strig to Json

    this.chatID = this.firestore.createId();
    
  

  this.firestore
  .collection('chatrooms')
  .doc(this.chatID).set(dishesInChart)

  console.log(this.chatID)
   
 
  
  }


  addmessage(){
 
   let hans = this.chatroomMessages
   var arrayToString = JSON.stringify(Object.assign({}, hans));  // convert array to string
   let dishesInChart2 = JSON.parse(arrayToString); //Strig to Json
 
  this.chatroom.chatsss.push(dishesInChart2)

  var arr = this.chatroom;
  var arrayToString = JSON.stringify(Object.assign({}, arr));  // convert array to string
  let dishesInChart = JSON.parse(arrayToString); //Strig to Json

  this.firestore
  .collection('chatrooms').doc(this.chatID)
  .update(dishesInChart)
 ;

 }
}
