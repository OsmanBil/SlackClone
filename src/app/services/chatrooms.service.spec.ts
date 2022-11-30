import { TestBed } from '@angular/core/testing';

import { ChatroomsService } from './chatrooms.service';

describe('ChatroomsService', () => {
  let service: ChatroomsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatroomsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
