import { Component, OnInit } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-dialog-create-channel',
  templateUrl: './dialog-create-channel.component.html',
  styleUrls: ['./dialog-create-channel.component.scss']
})
export class DialogCreateChannelComponent implements OnInit {

  loading = false;
  isChecked = true;

  channel = new Channel();

  constructor(public dialogRef: MatDialogRef<DialogCreateChannelComponent>, private firestore: AngularFirestore) { }

  ngOnInit(): void {
  }

  save(){
    this.loading = true;

    this.firestore
    .collection('channels')
    .add(this.channel.toJSON());

    this.loading = false;
    this.dialogRef.close();
  }

}
