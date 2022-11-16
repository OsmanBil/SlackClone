import { Component, Input, OnInit } from '@angular/core';
import { Chatroom } from 'src/models/chatrooms.class';
import { Message } from 'src/models/message.class';


import { chatroomUser } from 'src/models/chatroomUser.class';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from '@firebase/util';

import { getFirestore } from '@firebase/firestore';
import { collection, addDoc, getDocs, doc, Timestamp, setDoc, serverTimestamp, updateDoc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { user } from '@angular/fire/auth';

class City {
  name: any;
  state: any;
  country: any;

  constructor(name, state, country) {
    this.name = name;
    this.state = state;
    this.country = country;
  }
  toString() {
    return this.name + ', ' + this.state + ', ' + this.country;
  }
}




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

  chatroomUsers = { user: '', lastLogin: '45464' };
  chatroomMessages = { message: '', time: '', author: '' };

  chatroom =
    {
      usersss: this.chatroomUsers,
      chatsss: []
    };

  chatID: any;
  chatListener: [];


  db = getFirestore();

  unsub: any;


  mymodel;
  foundUsers: any[];
  usersWantToChat: any[] = [];

  @Input() chatActive:boolean = false;
  chatroomData = {
    numberOfUsers: 2
  }
  room: string[];
  roomidsSort: string[];
  roomid: string;

  constructor(private firestore: AngularFirestore,) { }
  ngOnInit(): void {
    this.unsub = onSnapshot(doc(this.db, "cities", "SF"), (doc) => {
      console.log("Current data: ", doc.data());
    });


  }



  async valuechange(newValue) {

    this.mymodel = newValue;
    let mymodelLength = String(this.mymodel).length;
    let mymodelLengthLowerCase = String(this.mymodel).toLocaleLowerCase();
    const usersRef = collection(this.db, "users")
    const q = query(usersRef, where('search', 'array-contains', mymodelLengthLowerCase));
    const querySnapshot = await getDocs(q);
    this.foundUsers = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      const founduser: any = { name: doc.data()['displayName'], imageUrl: doc.data()['photoURL'], id: doc.id };
      this.foundUsers.push(founduser)
    });


    // for(let i = 0; i < mymodelLength; i++){
    //   console.log(usersRef)
    // }
  }

  addUserWantToChat(i, input: HTMLInputElement) {
    if (this.usersWantToChat.includes(this.foundUsers[i]) == false) {
      this.usersWantToChat.push(this.foundUsers[i])
      input.value = '';
      const foundIndex = this.foundUsers.indexOf(this.foundUsers[i]);
      this.foundUsers.splice(foundIndex);
      
    } else {
      alert('This user already exists')
    }
  }

  deleteUserWantToChat(i){
    this.usersWantToChat.splice(i);
  }

  async createChat(){
    const localUser: any = JSON.parse(localStorage.getItem('user'))
  
    this.room = [this.foundUsers[0].id + localUser.uid]
    this.roomidsSort = this.room.sort();
    this.roomid = '';
    for(let r = 0; r < this.roomidsSort.length; r++){
      this.roomid += this.roomidsSort[r]
    }
    await setDoc(doc(this.db, "chatrooms", this.roomid), this.chatroomData)
  }

  async updateSnap() {

    this.unsub.state = 'neuer Staat';
    onSnapshot(doc(this.db, "cities", "SF"), (doc) => {
      console.log("Current data: ", doc.data());
    })


    // const ref = doc(this.db, "cities", "SF");
    // await setDoc(ref, new City("Neue Stadt", "CA", "USA"));

  }

  async searchUser() {
    try {
      const docRef = await addDoc(collection(this.db, "DOC"), {
        first: "Ada",
        last: "Lovelace",
        born: 1815
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  }

  async searchUser2() {
    // FÜGE DOKUMENTE HINZU
    try {
      const docRef = await addDoc(collection(this.db, "chatrooms2"), {
        first: "Alan",
        middle: "Mathison",
        last: "Turing",
        born: 1912
      });
      // const docRefID = await addDoc(collection(this.db, "chatrooms2")
      // console.log("Document written with ID: ", docRefID);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    // LOGT DIE ÄNDERUNG VON FIREBASE AUS
    const querySnapshot = await getDocs(collection(this.db, "DOC"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });

  }

  async updateDoc2() {
    // To update age and favorite color:
    const frankDocRef = doc(this.db, "update", "frank");


    const docRef = doc(this.db, "update", "frank");
    const docSnap = await getDoc(docRef);
    const ageee: any = docSnap.data()

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      console.log(ageee.age);

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }

    await updateDoc(frankDocRef, {
      "age": "14",
      "favorites.color": "Red"
    });


  }

  async zeit() {
    const docData = {
      stringExample: "Hello world!",
      booleanExample: true,
      numberExample: 3.14159265,
      dateExample: Timestamp.fromDate(new Date()),
      arrayExample: [5, true, "hello"],
      nullExample: null,
      objectExample: {
        a: 5,
        b: {
          nested: "foo"
        }
      }
    };
    await setDoc(doc(this.db, "data", "one"), docData);

  }

  async benutzteObjekte() {
    // Firestore data converter
    const cityConverter = {
      toFirestore: (city) => {
        return {
          name: city.name,
          state: city.state,
          country: city.country
        };
      },
      fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new City(data.name, data.state, data.country);
      }
    };

    const ref = doc(this.db, "cities", "SF").withConverter(cityConverter);
    await setDoc(ref, new City("Los Angeles", "CA", "USA"));
  }




  save() {
    var arr = this.chatroom;
    var arrayToString = JSON.stringify(Object.assign({}, arr));  // convert array to string
    let dishesInChart = JSON.parse(arrayToString); //Strig to Json

    this.chatID = this.firestore.createId();

    this.firestore
      .collection('chatrooms')
      .doc(this.chatID).set(dishesInChart)

    console.log(this.chatID)
  }


  addmessage() {

    let hans = this.chatroomMessages
    var arrayToString = JSON.stringify(Object.assign({}, hans));  // convert array to string
    let dishesInChart2 = JSON.parse(arrayToString); //Strig to Json

    this.chatroom.chatsss.push(dishesInChart2)

    var arr = this.chatroom;
    var arrayToString = JSON.stringify(Object.assign({}, arr));  // convert array to string
    let dishesInChart = JSON.parse(arrayToString); //Strig to Json

    this.firestore
      .collection('chatrooms').doc(this.chatID)
      .update(dishesInChart);
  }
}
