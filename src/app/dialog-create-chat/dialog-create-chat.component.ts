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

  chatroom2 = new Chatroom();
  chatroomUser = new chatroomUser();

  neueMessage = [];
  
  chatroom = [
    [{user: 'ASdf', lastLogin: '5'}],
    [{message: 'blabla', time: '5454', author: 'osman'}]
  ]

chatID: any;


constructor(private firestore: AngularFirestore) { }
  ngOnInit(): void {
  }

  
  save(){ 
    var arr = this.chatroom;
    var arrayToString = JSON.stringify(Object.assign({}, arr));  // convert array to string
    let dishesInChart = JSON.parse(arrayToString); //Strig to Json

    this.chatID = this.firestore.createId()
    
  

  this.firestore
  .collection('chatrooms')
  .doc(this.chatID).set(dishesInChart)

  console.log(this.chatID)
   
 
  
  }


 async addmessage(){
  let hans = {message: 'hans hans kanns 222',}
  var arrayToString = JSON.stringify(Object.assign({}, hans));  // convert array to string
  let dishesInChart2 = JSON.parse(arrayToString); //Strig to Json
 
  this.chatroom[1].push(dishesInChart2)

  var arr = this.chatroom;
  var arrayToString = JSON.stringify(Object.assign({}, arr));  // convert array to string
  let dishesInChart = JSON.parse(arrayToString); //Strig to Json

  this.firestore
  .collection('chatrooms').doc(this.chatID)
  .update(dishesInChart)
 ;

 }
}
