import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss']
})
export class LightboxComponent implements OnInit {

  lightboxImg = '';

  constructor(public dialogRef: MatDialogRef<LightboxComponent>) { }

  ngOnInit(): void {
  }

}
