import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateChatComponent } from './dialog-create-chat.component';

describe('DialogCreateChatComponent', () => {
  let component: DialogCreateChatComponent;
  let fixture: ComponentFixture<DialogCreateChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCreateChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
