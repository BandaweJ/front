import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDialoComponent } from './confirmation-dialo.component';

describe('ConfirmationDialoComponent', () => {
  let component: ConfirmationDialoComponent;
  let fixture: ComponentFixture<ConfirmationDialoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationDialoComponent]
    });
    fixture = TestBed.createComponent(ConfirmationDialoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
