import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SignInComponent } from './login-components/sign-in/sign-in.component';
import { SignUpComponent } from './login-components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './login-components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './login-components/verify-email/verify-email.component';

const routes: Routes = [
  {path: '', component: MainpageComponent},
  {path: 'mainpage', component: MainpageComponent},
  { path: 'sign-in', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
