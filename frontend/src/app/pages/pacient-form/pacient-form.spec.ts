import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientForm } from './pacient-form';

describe('PacientForm', () => {
  let component: PacientForm;
  let fixture: ComponentFixture<PacientForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
