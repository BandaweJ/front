import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrolStudentComponent } from './enrol-student.component';

describe('EnrolStudentComponent', () => {
  let component: EnrolStudentComponent;
  let fixture: ComponentFixture<EnrolStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnrolStudentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrolStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
