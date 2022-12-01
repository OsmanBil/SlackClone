import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  hide = true;

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);

  constructor(public authService: AuthService) { }

  ngOnInit(): void {

  }
}


