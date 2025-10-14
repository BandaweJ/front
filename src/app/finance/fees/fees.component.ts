import { ROLES } from './../../registration/models/roles.enum';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { feesActions } from '../store/finance.actions';
import { selectFees, selectIsLoading } from '../store/finance.selector';
import { FeesModel } from '../models/fees.model';
import { MatDialog } from '@angular/material/dialog';
import { AddEditFeesComponent } from './add-edit-fees/add-edit-fees.component';
import { SharedService } from 'src/app/shared.service';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FeesNames } from '../enums/fees-names.enum';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeesComponent implements OnInit, OnDestroy {
  fees$ = this.store.select(selectFees);
  isLoading$ = this.store.select(selectIsLoading);
  user$ = this.store.select(selectUser);
  role!: ROLES;

  // Organized fee categories
  oLevelDayFees: FeesModel[] = [];
  oLevelBoarderFees: FeesModel[] = [];
  oLevelAdditionalFees: FeesModel[] = [];
  aLevelDayFees: FeesModel[] = [];
  aLevelBoarderFees: FeesModel[] = [];
  aLevelScienceFees: FeesModel[] = [];
  newStudentFees: FeesModel[] = [];
  optionalServiceFees: FeesModel[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog,
    public sharedService: SharedService
  ) {
    this.store.dispatch(feesActions.fetchFees());
  }

  ngOnInit(): void {
    this.fees$.pipe(takeUntil(this.destroy$)).subscribe((fees) => {
      this.organizeFeesByCategory(fees);
    });

    this.user$.pipe(takeUntil(this.destroy$)).subscribe((usr) => {
      if (usr?.role) this.role = usr.role;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private organizeFeesByCategory(fees: FeesModel[]): void {
    // Reset all categories
    this.oLevelDayFees = [];
    this.oLevelBoarderFees = [];
    this.oLevelAdditionalFees = [];
    this.aLevelDayFees = [];
    this.aLevelBoarderFees = [];
    this.aLevelScienceFees = [];
    this.newStudentFees = [];
    this.optionalServiceFees = [];

    fees.forEach(fee => {
      switch (fee.name) {
        // O Level Fees
        case FeesNames.oLevelTuitionDay:
          this.oLevelDayFees.push(fee);
          break;
        case FeesNames.oLevelTuitionBoarder:
          this.oLevelBoarderFees.push(fee);
          break;
        case FeesNames.oLevelScienceFee:
        case FeesNames.developmentFee:
          this.oLevelAdditionalFees.push(fee);
          break;

        // A Level Fees
        case FeesNames.aLevelTuitionDay:
          this.aLevelDayFees.push(fee);
          break;
        case FeesNames.aLevelTuitionBoarder:
          this.aLevelBoarderFees.push(fee);
          break;
        case FeesNames.alevelScienceFee:
          this.aLevelScienceFees.push(fee);
          break;

        // New Student Fees
        case FeesNames.oLevelApplicationFee:
        case FeesNames.aLevelApplicationFee:
        case FeesNames.deskFee:
          this.newStudentFees.push(fee);
          break;

        // Optional Services
        case FeesNames.foodFee:
        case FeesNames.transportFee:
          this.optionalServiceFees.push(fee);
          break;
      }
    });
  }

  getFeeDisplayName(feeName: FeesNames): string {
    const displayNames: { [key in FeesNames]: string } = {
      [FeesNames.oLevelApplicationFee]: 'O Level Application Fee',
      [FeesNames.aLevelApplicationFee]: 'A Level Application Fee',
      [FeesNames.deskFee]: 'Desk Fee',
      [FeesNames.oLevelTuitionDay]: 'O Level Day Tuition',
      [FeesNames.aLevelTuitionDay]: 'A Level Day Tuition',
      [FeesNames.oLevelTuitionBoarder]: 'O Level Boarder Tuition',
      [FeesNames.aLevelTuitionBoarder]: 'A Level Boarder Tuition',
      [FeesNames.oLevelScienceFee]: 'O Level Science Fee',
      [FeesNames.alevelScienceFee]: 'A Level Science Fee',
      [FeesNames.developmentFee]: 'Development Fee',
      [FeesNames.foodFee]: 'Food Fee',
      [FeesNames.transportFee]: 'Transport Fee'
    };
    return displayNames[feeName] || feeName;
  }

  openAddFeesDialog(): void {
    const dialogRef = this.dialog.open(AddEditFeesComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(feesActions.fetchFees());
      }
    });
  }

  openEditFeesDialog(fee: FeesModel): void {
    const dialogRef = this.dialog.open(AddEditFeesComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: { mode: 'edit', fee: fee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(feesActions.fetchFees());
      }
    });
  }
}