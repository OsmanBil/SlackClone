import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})


export class SidenavComponent implements OnInit {

  channels = [];

  channelOpen = true;
  messageOpen = false;

  constructor(public dialog: MatDialog, private firestore: AngularFirestore) {}


  ngOnInit(): void {
    this.firestore
    .collection('channels')
    .valueChanges({ idField: 'channelId' })
    .subscribe((changes: any) => {

      this.channels = changes;
      console.log("Wird von firestore geladen:", this.channels);
    })

    console.log("Dieser Code wird direkt ausgegeben:", this.channels);
  }


  openDialogCreateChannel(){
    this.dialog.open(DialogCreateChannelComponent);
  }


  toggleChannelMenu(){
    if(this.channelOpen){
      this.channelOpen = false;
    }
    else{
      this.channelOpen = true;
    }
  }


  toggleMessageMenu(){
    if(this.messageOpen){
      this.messageOpen = false;
    }
    else{
      this.messageOpen = true;
    }
  }
}
