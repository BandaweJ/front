import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionSummaryByTypeTableComponentComponent } from './exemption-summary-by-type-table.component.component';

describe('ExemptionSummaryByTypeTableComponentComponent', () => {
  let component: ExemptionSummaryByTypeTableComponentComponent;
  let fixture: ComponentFixture<ExemptionSummaryByTypeTableComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExemptionSummaryByTypeTableComponentComponent]
    });
    fixture = TestBed.createComponent(ExemptionSummaryByTypeTableComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
