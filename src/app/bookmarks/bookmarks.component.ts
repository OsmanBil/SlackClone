import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { addDoc, collection, getFirestore } from '@firebase/firestore';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss']
})
export class BookmarksComponent implements OnInit {

  db = getFirestore();
  link: string = '';
  linkName: string = '';
  currentChatroomID;

  constructor(public dialogRef: MatDialogRef<BookmarksComponent>, private route: ActivatedRoute) { }

  ngOnInit(): void {
    

  }

  async addBookmark(){
    const docRef = await addDoc(collection(this.db, "chatrooms", this.currentChatroomID, 'bookmarks' ), {
      name: this.linkName,
      link: this.link,
    });
    this.dialogRef.close();
  }
}
