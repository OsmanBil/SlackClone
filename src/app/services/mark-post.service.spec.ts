import { TestBed } from '@angular/core/testing';

import { MarkPostService } from './mark-post.service';

describe('MarkPostService', () => {
  let service: MarkPostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkPostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
