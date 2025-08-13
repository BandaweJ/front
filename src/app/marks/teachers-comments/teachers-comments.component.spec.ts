import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersCommentsComponent } from './teachers-comments.component';

describe('TeachersCommentsComponent', () => {
  let component: TeachersCommentsComponent;
  let fixture: ComponentFixture<TeachersCommentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeachersCommentsComponent]
    });
    fixture = TestBed.createComponent(TeachersCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
