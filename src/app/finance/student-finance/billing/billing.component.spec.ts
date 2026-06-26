import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { BillingComponent } from './billing.component';
import { Residence } from 'src/app/enrolment/models/residence.enum';
import { FeesModel } from '../../models/fees.model';
import { ThemeService } from '../../../services/theme.service';
import { SharedService } from 'src/app/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('BillingComponent', () => {
  let component: BillingComponent;
  let fixture: ComponentFixture<BillingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BillingComponent],
      providers: [
        provideMockStore({ initialState: {} }),
        {
          provide: ThemeService,
          useValue: { theme$: of('light') },
        },
        {
          provide: SharedService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: MatSnackBar,
          useValue: { open: jasmine.createSpy('open') },
        },
      ],
    });
    fixture = TestBed.createComponent(BillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the reduced food fee for vacation day-residence billing', () => {
    component.isVacationTerm = true;
    component.academicLevel = 'O Level';
    component.oLevelAccommodationType.setValue(Residence.Day);

    const fee = {
      id: 1,
      name: 'foodFee',
      amount: 200,
    } as FeesModel;

    const resolvedFee = (component as any).getFeeForCurrentContext(fee);

    expect(resolvedFee.amount).toBe(60);
  });

  it('should keep the standard food fee outside the vacation day-residence rule', () => {
    component.isVacationTerm = false;
    component.academicLevel = 'O Level';
    component.oLevelAccommodationType.setValue(Residence.Boarder);

    const fee = {
      id: 1,
      name: 'foodFee',
      amount: 200,
    } as FeesModel;

    const resolvedFee = (component as any).getFeeForCurrentContext(fee);

    expect(resolvedFee.amount).toBe(200);
  });
});
