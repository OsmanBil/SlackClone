import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  hide = true;

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  userNameFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

}
