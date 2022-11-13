import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { User } from '../services/user';

@Component({
  selector: 'app-dialog-edit-user',
  templateUrl: './dialog-edit-user.component.html',
  styleUrls: ['./dialog-edit-user.component.scss']
})
export class DialogEditUserComponent implements OnInit {

  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadProgress: Observable<number>;
  uploadState: Observable<string>;
  downloadURL: Observable<string>;
  fb;

  user: User;
  userId = '';
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<DialogEditUserComponent>,
    private firestore: AngularFirestore,
    private afStorage: AngularFireStorage) { }

  ngOnInit(): void {

  }


  upload = (event) => {
    const randomId = Math.random().toString(36).substring(2);
    this.ref = this.afStorage.ref('/images/' + randomId);
    this.task = this.ref.put(event.target.files[0]);
    
    // observe upload progress
    this.uploadProgress = this.task.percentageChanges();
    // get notified when the download URL is available
    this.task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = this.ref.getDownloadURL();
        this.downloadURL.subscribe(url => {
          if (url) {
            this.fb = url;
            console.log(this.fb);
          }
      });
    })
    )
    .subscribe();

    this.uploadState = this.task.snapshotChanges().pipe(map(s => s.state));
  }


  discardUpload(){
    this.downloadURL = null;
    this.uploadState = null;
  }


  changePicture(){
    this.user['photoURL'] = this.fb;
    this.downloadURL = null;
    this.uploadState = null;
  }


  save() {
    this.loading = true;
    this.firestore
    .collection('users')
    .doc(this.userId)
    .update(this.user)
    .then(() =>{
      this.loading = false;
      this.dialogRef.close();
    });
  }

}
