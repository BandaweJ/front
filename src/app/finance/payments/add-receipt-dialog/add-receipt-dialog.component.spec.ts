import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceiptDialogComponent } from './add-receipt-dialog.component';

describe('AddReceiptDialogComponent', () => {
  let component: AddReceiptDialogComponent;
  let fixture: ComponentFixture<AddReceiptDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddReceiptDialogComponent]
    });
    fixture = TestBed.createComponent(AddReceiptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
