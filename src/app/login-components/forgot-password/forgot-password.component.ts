import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit(): void {
  }

}
