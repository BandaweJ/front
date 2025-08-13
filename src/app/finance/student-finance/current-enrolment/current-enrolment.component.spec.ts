import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentEnrolmentComponent } from './current-enrolment.component';

describe('CurrentEnrolmentComponent', () => {
  let component: CurrentEnrolmentComponent;
  let fixture: ComponentFixture<CurrentEnrolmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentEnrolmentComponent]
    });
    fixture = TestBed.createComponent(CurrentEnrolmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
