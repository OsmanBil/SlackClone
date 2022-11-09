import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})


export class SidenavComponent implements OnInit {

  channels = [];

  channelOpen = true;
  messageOpen = false;

  constructor(public dialog: MatDialog, private firestore: AngularFirestore,) {}


  ngOnInit(): void {
    this.firestore
      .collection('channels')
      .valueChanges({ idField: 'channelId' })
      .subscribe((changes: any) => {
        this.channels = changes;
    })

   
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
