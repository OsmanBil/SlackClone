import { Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Chatroom } from "src/models/chatrooms.class";
import { GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from '@angular/fire/auth';
import { getFirestore } from '@firebase/firestore';
import { doc, updateDoc } from '@firebase/firestore';


@Injectable({
  providedIn: 'root',
})


export class AuthService {


  db = getFirestore();
  userData: any; // Save logged in user data

  constructor(
    public firestore: AngularFirestore,
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {

        //if user us true -> load from database and set new local storage
        this.firestore.collection(`users`).doc(user.uid).get().subscribe(ref => {
          this.userData = ref.data();
          localStorage.setItem('user', JSON.stringify(this.userData));
          JSON.parse(localStorage.getItem('user')!);
        });

      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }


  // Sign in with email/password
  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user, name);
        this.afAuth.authState.subscribe((user) => {
          if (user) {
            this.router.navigate(['mainpage']);
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }


  // Sign in with Google
  async GoogleAuth() {
    await this.AuthLogin(new auth.GoogleAuthProvider())
      .then(async () => {
        setTimeout(() => { this.router.navigate(['mainpage']) }, 500);
        //await this.router.navigate(['mainpage']);
      });


  }



  // Sign up with email/password
  SignUp(email: string, password: string, name: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {

        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user, name);
        // this.setUsername(result)
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }





  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }


  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }


  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }





  // Auth logic to run auth providers
  async AuthLogin(provider: any) {
    await this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.SetUserData(result.user, name);
      })
      .catch((error) => {
        window.alert(error);
      })
      .finally(() => {
        this.router.navigate(['mainpage']);
      });
  }


  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */

  async SetUserData(user: any, name: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    this.firestore.collection(`users`).doc(user.uid).get().subscribe(ref => {

      if (!ref.exists) {

        //console.log('Name:', name)
        if (name) {
          let searchName = String(name);
          let searchUserValue = '';
          let userData: User = {
            uid: user.uid,
            email: user.email,
            displayName: name,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            isOnline: true,
            search: [],
          };

          for (let i = 0; i < searchName.length; i++) {
            searchUserValue += searchName[i]
            userData.search.push(String(searchUserValue).toLowerCase())
          }

          userRef.set(userData, {
            merge: true,
          });
          this.firestore.collection('users').doc(user.uid).collection('chatids').add({});

        } else {
          let searchName = String(user.displayName);
          let searchUserValue = '';
          let userData: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            isOnline: true,
            search: [],
          };

          for (let i = 0; i < searchName.length; i++) {
            searchUserValue += searchName[i]
            userData.search.push(String(searchUserValue).toLowerCase())
          }

          userRef.set(userData, {
            merge: true,
          });
          this.firestore.collection('users').doc(user.uid).collection('chatids').add({});

        }


      } else {
        this.firestore.collection(`users`).doc(user.uid).get().subscribe(async ref => {
          const doc: any = ref.data();
          let searchName = String(user.displayName);
          let searchUserValue = '';
          let userData: User = {
            uid: doc.uid,
            email: doc.email,
            displayName: doc.displayName,
            photoURL: doc.photoURL,
            emailVerified: doc.emailVerified,
            isOnline: true,
            search: [],
          };


          for (let i = 0; i < searchName.length; i++) {
            searchUserValue += searchName[i]
            userData.search.push(String(searchUserValue).toLowerCase())
          }

          userRef.set(userData, {
            merge: true,
          });
          this.firestore.collection('users').doc(user.uid).collection('chatids').add({});


          this.firestore
            .collection('users')
            .doc(doc.uid)
            .update(userData);





          // Get the existing data
          var existing = localStorage.getItem('user');

          // If no existing data, create an array
          // Otherwise, convert the localStorage string to an array
          existing = existing ? JSON.parse(existing) : {};

          // Add new data to localStorage Array
          existing['isOnline'] = true;

          // Save back to localStorage
          localStorage.setItem('user', JSON.stringify(existing));


        });


      }

    });


    // this.firestore.collection(`users`).doc(user.uid).collection('search').get().subscribe(ref => {

    //   let searchName = String(user.displayName);
    //   let searchUserValue = '';
    //   let searchUserValueArray = [];

    //   for (let i = 0; i < searchName.length; i++) {
    //     searchUserValue += searchName[i]
    //     console.log(searchUserValue)
    //   }
    //   console.log(searchUserValue)

    //   // for(let i = 0; i < searchName.lenght; )

    // });





  }


  // Sign out
  async SignOut() {
    return this.afAuth.signOut()
      .then(() => this.logOut())
      .finally(() => this.router.navigate(['sign-in']));
    // window.location.reload();

  }


  logOut() {
  
    // Get the existing data
    var existing = localStorage.getItem('user');

    // If no existing data, create an array
    // Otherwise, convert the localStorage string to an array
    existing = existing ? JSON.parse(existing) : {};

    // Add new data to localStorage Array
    existing['isOnline'] = false;

    // Save back to localStorage
    localStorage.setItem('user', JSON.stringify(existing));

    console.log('String?', existing['uid'])

    let userID = existing['uid']

  
    this.firestore.collection(`users`).doc(userID).get().subscribe(async ref => {
      const doc: any = ref.data();
      let searchName = String(doc.displayName);
      let searchUserValue = '';

      const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${doc.uid}`);
      let userData: User = {
        uid: doc.uid,
        email: doc.email,
        displayName: doc.displayName,
        photoURL: doc.photoURL,
        emailVerified: doc.emailVerified,
        isOnline: false,
        search: [],
      };

      
      for (let i = 0; i < searchName.length; i++) {
        searchUserValue += searchName[i]
        userData.search.push(String(searchUserValue).toLowerCase())
      }

      userRef.set(userData, {
        merge: true,
      });
      this.firestore.collection('users').doc(doc.uid).collection('chatids').add({});

      this.firestore
        .collection('users')
        .doc(doc.uid)
        .update(userData);

    });
    localStorage.removeItem('user')

  }
}