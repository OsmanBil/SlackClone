import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentBoxThreadComponent } from './comment-box-thread.component';

describe('CommentBoxThreadComponent', () => {
  let component: CommentBoxThreadComponent;
  let fixture: ComponentFixture<CommentBoxThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentBoxThreadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentBoxThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
