import { TestBed } from '@angular/core/testing';

import { ExamData } from './exam-data';

describe('ExamData', () => {
  let service: ExamData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
