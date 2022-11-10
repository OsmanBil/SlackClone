import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SignInComponent } from './login-components/sign-in/sign-in.component';
import { SignUpComponent } from './login-components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './login-components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './login-components/verify-email/verify-email.component';
// route guard
import { AuthGuard } from './shared/guard/auth.guard';
import { DialogCreateChannelComponent } from './dialog-create-channel/dialog-create-channel.component';
import { DialogCreateChatComponent } from './dialog-create-chat/dialog-create-chat.component';

const routes: Routes = [
 // { path: '', component: MainpageComponent},
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent },
  { path: 'mainpage', component: MainpageComponent, canActivate: [AuthGuard] ,
    children:[
      {path: '', component: DialogCreateChatComponent},
      {path: 'create-chanel', component: DialogCreateChatComponent},
    ]},
];




@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
