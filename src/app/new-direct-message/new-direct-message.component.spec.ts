import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDirectMessageComponent } from './new-direct-message.component';

describe('NewDirectMessageComponent', () => {
  let component: NewDirectMessageComponent;
  let fixture: ComponentFixture<NewDirectMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewDirectMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDirectMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
