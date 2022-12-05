import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialogRef } from '@angular/material/dialog';
import { Channel } from 'src/models/channel.class';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';

@Component({
  selector: 'app-channel-details',
  templateUrl: './channel-details.component.html',
  styleUrls: ['./channel-details.component.scss']
})
export class ChannelDetailsComponent implements OnInit {

  channel : Channel;
  channelId = '';
  loading = false;
  editingName = false;
  editingDescription = false;
  editingPrivacy = false;

  constructor(private firestore: AngularFirestore, public dialogRef: MatDialogRef<DialogCreateChannelComponent>) { }

  ngOnInit(): void {
  }

  editName(){
    this.editingName = true;
  }


  editDescription(){
    this.editingDescription = true;
  }


  editPrivacy(){
    this.editingPrivacy = true;
  }


  setName(){
    this.editingName = false;
  }


  setDescription(){
    this.editingDescription = false;
  }


  setPrivacy(){
    this.editingPrivacy = false;
  }


  save(){
    this.resetStats();

    this.firestore
    .collection('channels')
    .doc(this.channelId)
    .update(this.channel.toJSON())
    .then(()=>{
      this.loading = false;
      this.dialogRef.close();
    })
  }


  resetStats(){
    this.editingName = false;
    this.editingDescription = false;
    this.editingPrivacy = false;
    this.loading = true;
  }

}
