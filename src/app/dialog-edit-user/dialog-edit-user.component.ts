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

  ProfileRef: AngularFireStorageReference;
  ProfileTask: AngularFireUploadTask;
  ProfileUploadProgress: Observable<number>;
  ProfileUploadState: Observable<string>;
  downloadURL: Observable<string>;
  imageURL: string;

  user: User;
  userId = '';
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<DialogEditUserComponent>,
    private firestore: AngularFirestore,
    private afStorage: AngularFireStorage) { }


  ngOnInit(): void { }


  upload = (event) => {
    const randomId = Math.random().toString(36).substring(2);
    this.ProfileRef = this.afStorage.ref('/images/' + randomId);
    this.ProfileTask = this.ProfileRef.put(event.target.files[0]);

    // observe upload progress
    this.ProfileUploadProgress = this.ProfileTask.percentageChanges();
    // get notified when the download URL is available
    this.ProfileTask.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = this.ProfileRef.getDownloadURL();
        this.downloadURL.subscribe(url => {
          if (url) {
            this.imageURL = url;
            this.ProfileUploadState = null;
          }
        });
      })
    )
      .subscribe();
    this.ProfileUploadState = this.ProfileTask.snapshotChanges().pipe(map(s => s.state));
  }


  discardUpload() {
    this.ProfileRef.delete();
    this.resetUpload();
  }


  changePicture() {
    try {
      this.afStorage.storage.refFromURL(this.user['photoURL']).delete()
    }
    catch (err) {
      console.log("Error ", err);
    }

    this.user['photoURL'] = this.imageURL;
    this.resetUpload();
    this.saveWithoutClose();
  }


  resetUpload() {
    this.downloadURL = null;
    this.ProfileUploadState = null;
    this.ProfileRef = null;
    this.ProfileTask = null;
  }


  saveWithoutClose() {
    this.loading = true;
    this.firestore
      .collection('users')
      .doc(this.userId)
      .update(this.user)
      .then(() => {
        this.saveLocalStoragePhoto(this.user);
        this.loading = false;
      });
  }


  save() {
    this.loading = true;
    this.firestore
      .collection('users')
      .doc(this.userId)
      .update(this.user)
      .then(() => {
        this.saveLocalStoragePhoto(this.user);
        this.loading = false;
        this.dialogRef.close();
      });
  }


  saveLocalStoragePhoto(user){
  // Get the existing data
  var existing = localStorage.getItem('user');

  // If no existing data, create an array
  // Otherwise, convert the localStorage string to an array
  existing = existing ? JSON.parse(existing) : {};

  // Add new data to localStorage Array
  existing['photoURL'] = user.photoURL;

  // Save back to localStorage
  localStorage.setItem('user', JSON.stringify(existing));

  }

}
