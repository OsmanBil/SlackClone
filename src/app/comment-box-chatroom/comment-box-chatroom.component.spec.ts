import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentBoxChatroomComponent } from './comment-box-chatroom.component';

describe('CommentBoxChatroomComponent', () => {
  let component: CommentBoxChatroomComponent;
  let fixture: ComponentFixture<CommentBoxChatroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentBoxChatroomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentBoxChatroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
