import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { QuillModule } from 'ngx-quill'

import { MatSidenavModule } from '@angular/material/sidenav';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DialogCreateChannelComponent } from './dialog-create-channel/dialog-create-channel.component';
import { MatCardModule} from '@angular/material/card'; 



//Angular Fire for Login

//import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { SignInComponent } from './login-components/sign-in/sign-in.component';
import { SignUpComponent } from './login-components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './login-components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './login-components/verify-email/verify-email.component';
import { AuthService } from "./services/auth.service";
import { DialogCreateChatComponent } from './dialog-create-chat/dialog-create-chat.component';
import { DialogEditUserComponent } from './dialog-edit-user/dialog-edit-user.component';
import { OpenChannelComponent } from './open-channel/open-channel.component';
import { CommentBoxComponent } from './comment-box/comment-box.component';
import { ChatroomComponent } from './chatroom/chatroom.component';
import { ThreadsComponent } from './threads/threads.component';
import { CommentBoxChatroomComponent } from './comment-box-chatroom/comment-box-chatroom.component';
import { ThreadComponent } from './thread/thread.component';
import { ChannelDetailsComponent } from './channel-details/channel-details.component';
import { SearchComponent } from './search/search.component';
import { LightboxComponent } from './lightbox/lightbox.component';



//import { environment } from '../environments/environment';



@NgModule({
  declarations: [
    AppComponent,
    MainpageComponent,
    SidenavComponent,
    DialogCreateChannelComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    DialogCreateChatComponent,
    DialogEditUserComponent,
    OpenChannelComponent,
    CommentBoxComponent,
    ChatroomComponent,
    ThreadsComponent,
    CommentBoxChatroomComponent,
    ThreadComponent,
    ChannelDetailsComponent,
    SearchComponent,
    LightboxComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatCardModule,
    MatSlideToggleModule,
    QuillModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  
    
    //Firebase Login Module imports
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,


    
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
