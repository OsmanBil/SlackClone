import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EditorChangeContent, EditorChangeSelection, QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss']
})


export class CommentBoxComponent implements OnInit {

  form: FormGroup;

  @ViewChild('editor', {
    static: true
  }) editor: QuillEditorComponent

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['image'],
      ['emoji']
    ],
  }

  text: string;

  constructor() {
    this.form = new FormGroup({
      'editor': new FormControl()
    });
  }


  ngOnInit(): void {
  }


  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    // tslint:disable-next-line:no-console
    if(event['event']== 'text-change'){
      this.text = event['html'];
      console.log(this.text);
    }
  }

}
