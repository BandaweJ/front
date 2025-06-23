import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  billStudentActions,
  feesActions,
  isNewComerActions,
} from '../../store/finance.actions';
import { FeesModel } from '../../models/fees.model';
import {
  selectedStudentInvoice,
  selectFees,
  selectIsNewComer,
} from '../../store/finance.selector';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { BillModel } from '../../models/bill.model';
import { SharedService } from 'src/app/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from 'src/app/confirm-delete-dialog/confirm-delete-dialog.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Residence } from 'src/app/enrolment/models/residence.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, combineLatest, Subject } from 'rxjs'; // Added Subject
import { startWith, distinctUntilChanged, map } from 'rxjs/operators'; // Added map

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class BillingComponent implements OnInit, OnChanges, OnDestroy {
  fees: FeesModel[] = [];
  isNewComer$ = this.store.select(selectIsNewComer);
  isScienceStudent: boolean = false;
  @Input() enrolment: EnrolsModel | null = null;
  selectedBills: BillModel[] = []; // Bills already associated with the invoice from backend
  toBill: BillModel[] = []; // Temporary staging area for bills to be processed on save

  academicLevel!: 'O Level' | 'A Level'; // Tracks currently selected academic level for UI logic
  showTransportFoodOptions: boolean = false; // Controls visibility of transport/food section

  academicSettingsForm!: FormGroup;
  accommodationOptions = Object.values(Residence); // Use Object.values for enum strings

  // --- Subscriptions to manage memory leaks ---
  private subscriptions: Subscription[] = [];
  private feesSubscription!: Subscription;
  private selectedAcademicLevelSubscription!: Subscription;
  private oLevelNewComerSubscription!: Subscription;
  private aLevelNewComerSubscription!: Subscription;
  private aLevelScienceLevySubscription!: Subscription;
  private oLevelAccommodationSubscription!: Subscription;
  private aLevelAccommodationSubscription!: Subscription;
  private foodOptionSubscription!: Subscription;
  private transportOptionSubscription!: Subscription;
  private selectedStudentInvoiceSubscription!: Subscription;

  // Subject to manually trigger updates for combined accommodation logic
  private accommodationTypeTrigger$: Subject<void> = new Subject<void>();

  // --- Properties to track currently selected exclusive fees ---
  // These help in removing the *old* fee when a new one is selected in a radio group
  private currentOLevelAccommodationFee: FeesModel | undefined;
  private currentALevelAccommodationFee: FeesModel | undefined;

  constructor(
    private store: Store,
    public sharedService: SharedService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.store.dispatch(feesActions.fetchFees());
  }

  // --- Getters for Form Controls for cleaner access ---
  get selectedAcademicLevel(): FormControl {
    return this.academicSettingsForm.get(
      'selectedAcademicLevel'
    ) as FormControl;
  }
  get oLevelNewComer(): FormControl {
    return this.academicSettingsForm.get('oLevelNewComer') as FormControl;
  }
  get aLevelNewComer(): FormControl {
    return this.academicSettingsForm.get('aLevelNewComer') as FormControl;
  }
  get aLevelScienceLevy(): FormControl {
    return this.academicSettingsForm.get('aLevelScienceLevy') as FormControl;
  }
  get oLevelAccommodationType(): FormControl {
    return this.academicSettingsForm.get(
      'oLevelAccommodationType'
    ) as FormControl;
  }
  get aLevelAccommodationType(): FormControl {
    return this.academicSettingsForm.get(
      'aLevelAccommodationType'
    ) as FormControl;
  }
  get foodOption(): FormControl {
    return this.academicSettingsForm.get('foodOption') as FormControl;
  }
  get transportOption(): FormControl {
    return this.academicSettingsForm.get('transportOption') as FormControl;
  }

  ngOnInit(): void {
    // 1. Initialize the form group with default values
    this.academicSettingsForm = this.fb.group({
      selectedAcademicLevel: ['O Level', Validators.required],
      oLevelNewComer: [false],
      aLevelNewComer: [false],
      aLevelScienceLevy: [false],
      oLevelAccommodationType: [null, Validators.required],
      aLevelAccommodationType: [null, Validators.required],
      foodOption: [false],
      transportOption: [false],
    });

    // 2. Subscribe to fees from Ngrx store. This is crucial as fee IDs are needed for billing.
    this.feesSubscription = this.store.select(selectFees).subscribe((fees) => {
      this.fees = fees;
      // After fees are loaded, if an enrolment is already present, attempt to populate form/toBill
      // based on selectedBills (which would have been updated by selectedStudentInvoiceSubscription).
      // This handles cases where fees load *after* the invoice.
      if (this.enrolment && this.selectedBills.length > 0) {
        this.populateFormAndToBillFromSelectedBills(this.selectedBills);
      }
    });
    this.subscriptions.push(this.feesSubscription);

    // 3. Subscribe to selected student invoice from Ngrx store.
    // This should ideally trigger populating the form and `toBill` with existing invoice data.
    this.selectedStudentInvoiceSubscription = this.store
      .select(selectedStudentInvoice)
      .subscribe((invoice) => {
        this.selectedBills =
          invoice && Array.isArray(invoice.bills) ? [...invoice.bills] : [];
        // Only populate if fees are already loaded, otherwise feesSubscription will handle it.
        if (this.fees.length > 0) {
          this.populateFormAndToBillFromSelectedBills(this.selectedBills);
        }
      });
    this.subscriptions.push(this.selectedStudentInvoiceSubscription);

    // 4. --- Dynamic Form Logic: Control O Level / A Level specific fields ---
    this.selectedAcademicLevelSubscription =
      this.selectedAcademicLevel.valueChanges
        .pipe(
          startWith(this.selectedAcademicLevel.value) // Emit initial value to set up controls on load
        )
        .subscribe((level: 'O Level' | 'A Level') => {
          this.academicLevel = level;

          // Disable/Enable form controls based on the selected academic level
          if (level === 'O Level') {
            this.oLevelNewComer.enable({ emitEvent: false });
            this.oLevelAccommodationType.enable({ emitEvent: false });
            this.aLevelNewComer.disable({ emitEvent: false });
            this.aLevelScienceLevy.disable({ emitEvent: false });
            this.aLevelAccommodationType.disable({ emitEvent: false });
          } else {
            // 'A Level'
            this.aLevelNewComer.enable({ emitEvent: false });
            this.aLevelScienceLevy.enable({ emitEvent: false });
            this.aLevelAccommodationType.enable({ emitEvent: false });
            this.oLevelNewComer.disable({ emitEvent: false });
            this.oLevelAccommodationType.disable({ emitEvent: false });
          }

          // Reset values of disabled controls to avoid carrying over incorrect state
          this.resetDisabledControls(level);
          // Trigger the accommodation logic after academic level change
          this.accommodationTypeTrigger$.next();
        });
    this.subscriptions.push(this.selectedAcademicLevelSubscription);

    // 5. --- Dynamic Form Logic: Control visibility of Transport & Food based on Accommodation Type ---
    // Create an observable that emits when any relevant form control changes OR when manually triggered
    const combinedAccommodationObservable$ = combineLatest([
      this.oLevelAccommodationType.valueChanges.pipe(
        startWith(this.oLevelAccommodationType.value)
      ),
      this.aLevelAccommodationType.valueChanges.pipe(
        startWith(this.aLevelAccommodationType.value)
      ),
      this.selectedAcademicLevel.valueChanges.pipe(
        startWith(this.selectedAcademicLevel.value)
      ),
      this.accommodationTypeTrigger$.pipe(startWith(undefined)), // Include the trigger Subject
    ]).pipe(
      // We only care about the first three values for the logic, discard the trigger signal
      map(([oLevelAcc, aLevelAcc, academicLevel, _]) => ({
        oLevelAcc,
        aLevelAcc,
        academicLevel,
      }))
    );

    const accommodationCombinedSubscription =
      combinedAccommodationObservable$.subscribe(
        ({ oLevelAcc, aLevelAcc, academicLevel }) => {
          let shouldShow = false;

          if (academicLevel === 'O Level' && oLevelAcc === Residence.Day) {
            shouldShow = true;
          } else if (
            academicLevel === 'A Level' &&
            aLevelAcc === Residence.Day
          ) {
            shouldShow = true;
          }

          this.showTransportFoodOptions = shouldShow;

          if (!shouldShow) {
            this.foodOption.disable({ emitEvent: false });
            this.foodOption.setValue(false, { emitEvent: false });
            // Ensure fee is found before attempting to remove it
            this.removeFeeFromToBill(
              this.fees.find((f) => f.name.includes('foodFee'))!
            );

            this.transportOption.disable({ emitEvent: false });
            this.transportOption.setValue(false, { emitEvent: false });
            this.removeFeeFromToBill(
              this.fees.find((f) => f.name.includes('transportFee'))!
            );
          } else {
            this.foodOption.enable({ emitEvent: false });
            this.transportOption.enable({ emitEvent: false });
          }
        }
      );
    this.subscriptions.push(accommodationCombinedSubscription);

    // 6. --- Individual Form Control Change Listeners (Modify `toBill` locally) ---
    // These listeners update the `toBill` array based on user selections.
    // They are placed after the dynamic form logic to ensure controls are enabled/disabled correctly.

    this.oLevelNewComerSubscription =
      this.oLevelNewComer.valueChanges.subscribe((value) => {
        const deskFee = this.fees.find((fee) => fee.name.includes('deskFee'));
        const oLevelAppFee = this.fees.find((fee) =>
          fee.name.includes('oLevelApplicationFee')
        );

        if (value) {
          if (deskFee) this.addFeeToToBill(deskFee);
          if (oLevelAppFee) this.addFeeToToBill(oLevelAppFee);
        } else {
          if (deskFee) this.removeFeeFromToBill(deskFee);
          if (oLevelAppFee) this.removeFeeFromToBill(oLevelAppFee);
        }
      });
    this.subscriptions.push(this.oLevelNewComerSubscription);

    this.aLevelNewComerSubscription =
      this.aLevelNewComer.valueChanges.subscribe((value) => {
        const deskFee = this.fees.find((fee) => fee.name.includes('deskFee'));
        const aLevelAppFee = this.fees.find((fee) =>
          fee.name.includes('aLevelApplicationFee')
        );

        if (value) {
          if (deskFee) this.addFeeToToBill(deskFee);
          if (aLevelAppFee) this.addFeeToToBill(aLevelAppFee);
        } else {
          if (deskFee) this.removeFeeFromToBill(deskFee);
          if (aLevelAppFee) this.removeFeeFromToBill(aLevelAppFee);
        }
      });
    this.subscriptions.push(this.aLevelNewComerSubscription);

    this.aLevelScienceLevySubscription =
      this.aLevelScienceLevy.valueChanges.subscribe((value) => {
        const alevelScienceFee = this.fees.find((fee) =>
          fee.name.includes('alevelScienceFee')
        );
        if (value) {
          if (alevelScienceFee) this.addFeeToToBill(alevelScienceFee);
        } else {
          if (alevelScienceFee) this.removeFeeFromToBill(alevelScienceFee);
        }
      });
    this.subscriptions.push(this.aLevelScienceLevySubscription);

    this.foodOptionSubscription = this.foodOption.valueChanges.subscribe(
      (value) => {
        const foodFee = this.fees.find((fee) => fee.name.includes('foodFee'));
        if (value) {
          if (foodFee) this.addFeeToToBill(foodFee);
        } else {
          if (foodFee) this.removeFeeFromToBill(foodFee);
        }
      }
    );
    this.subscriptions.push(this.foodOptionSubscription);

    this.transportOptionSubscription =
      this.transportOption.valueChanges.subscribe((value) => {
        const transportFee = this.fees.find((fee) =>
          fee.name.includes('transportFee')
        );
        if (value) {
          if (transportFee) this.addFeeToToBill(transportFee);
        } else {
          if (transportFee) this.removeFeeFromToBill(transportFee);
        }
      });
    this.subscriptions.push(this.transportOptionSubscription);

    this.oLevelAccommodationSubscription =
      this.oLevelAccommodationType.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value: Residence | null) => {
          // 1. Remove the previously added accommodation fee, if any, for O-Level
          if (this.currentOLevelAccommodationFee) {
            this.removeFeeFromToBill(this.currentOLevelAccommodationFee);
            this.currentOLevelAccommodationFee = undefined;
          }

          // 2. Add the new accommodation fee based on the current selection
          let newFeeToAdd: FeesModel | undefined;
          if (value === Residence.Day) {
            newFeeToAdd = this.fees.find((fee) =>
              fee.name.includes('oLevelTuitionDay')
            );
          } else if (value === Residence.Boarder) {
            newFeeToAdd = this.fees.find((fee) =>
              fee.name.includes('oLevelTuitionBoarder')
            );
          }

          if (newFeeToAdd) {
            this.addFeeToToBill(newFeeToAdd);
            this.currentOLevelAccommodationFee = newFeeToAdd;
          }
        });
    this.subscriptions.push(this.oLevelAccommodationSubscription);

    this.aLevelAccommodationSubscription =
      this.aLevelAccommodationType.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value: Residence | null) => {
          // 1. Remove the previously added accommodation fee, if any, for A-Level
          if (this.currentALevelAccommodationFee) {
            this.removeFeeFromToBill(this.currentALevelAccommodationFee);
            this.currentALevelAccommodationFee = undefined;
          }

          // 2. Add the new accommodation fee based on the current selection
          let newFeeToAdd: FeesModel | undefined;
          if (value === Residence.Day) {
            newFeeToAdd = this.fees.find((fee) =>
              fee.name.includes('aLevelTuitionDay')
            );
          } else if (value === Residence.Boarder) {
            newFeeToAdd = this.fees.find((fee) =>
              fee.name.includes('aLevelTuitionBoarder')
            );
          }

          if (newFeeToAdd) {
            this.addFeeToToBill(newFeeToAdd);
            this.currentALevelAccommodationFee = newFeeToAdd;
          }
        });
    this.subscriptions.push(this.aLevelAccommodationSubscription);
  }

  /**
   * This method sets the form values and initializes `toBill` when an existing invoice is loaded.
   * It also sets the `current...AccommodationFee` trackers based on the loaded state.
   */
  private populateFormAndToBillFromSelectedBills(bills: BillModel[]): void {
    if (
      !this.fees ||
      this.fees.length === 0 ||
      !this.enrolment ||
      !this.enrolment.student
    ) {
      return;
    }

    const formUpdates: { [key: string]: any } = {};
    const initialToBill: BillModel[] = [];

    // Reset trackers for accommodation fees
    this.currentOLevelAccommodationFee = undefined;
    this.currentALevelAccommodationFee = undefined;

    // Helper to find fee by name pattern in fees array
    const findFee = (namePart: string) =>
      this.fees.find((fee) => fee.name.includes(namePart));
    const findBillByFeeName = (billsArray: BillModel[], namePart: string) =>
      billsArray.find((bill) => bill.fees.name.includes(namePart));

    // Populate form and initial `toBill` based on `selectedBills`
    // It's important to set initialToBill with bills that are actually in `selectedBills`
    // but using the `FeesModel` from `this.fees` to ensure consistency.

    // New Comer
    const oLevelAppBill = findBillByFeeName(bills, 'oLevelApplicationFee');
    const aLevelAppBill = findBillByFeeName(bills, 'aLevelApplicationFee');
    const deskBill = findBillByFeeName(bills, 'deskFee');

    if (oLevelAppBill) {
      formUpdates['oLevelNewComer'] = true;
      const fee = findFee('oLevelApplicationFee');
      // Reconstruct BillModel ensuring student/enrol are correct from current enrolment
      if (fee && this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...oLevelAppBill,
          fees: fee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
      if (
        deskBill &&
        findFee('deskFee') &&
        this.enrolment &&
        this.enrolment.student
      )
        initialToBill.push({
          ...deskBill,
          fees: findFee('deskFee')!,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
    }
    if (aLevelAppBill) {
      formUpdates['aLevelNewComer'] = true;
      const fee = findFee('aLevelApplicationFee');
      if (fee && this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...aLevelAppBill,
          fees: fee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
      // Desk fee might be added by either. Only add if not already added by OLevel Newcomer
      if (
        deskBill &&
        findFee('deskFee') &&
        !oLevelAppBill &&
        this.enrolment &&
        this.enrolment.student
      ) {
        initialToBill.push({
          ...deskBill,
          fees: findFee('deskFee')!,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
      }
    }

    // Science Levy
    const alevelScienceBill = findBillByFeeName(bills, 'alevelScienceFee');
    if (alevelScienceBill) {
      formUpdates['aLevelScienceLevy'] = true;
      const fee = findFee('alevelScienceFee');
      if (fee && this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...alevelScienceBill,
          fees: fee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
    }

    // Accommodation Type (mutually exclusive per level)
    const oLevelTuitionDayBill = findBillByFeeName(bills, 'oLevelTuitionDay');
    const oLevelTuitionBoarderBill = findBillByFeeName(
      bills,
      'oLevelTuitionBoarder'
    );
    const oLevelDayFee = findFee('oLevelTuitionDay');
    const oLevelBoarderFee = findFee('oLevelTuitionBoarder');

    if (oLevelTuitionDayBill && oLevelDayFee) {
      formUpdates['oLevelAccommodationType'] = Residence.Day;
      if (this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...oLevelTuitionDayBill,
          fees: oLevelDayFee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
      this.currentOLevelAccommodationFee = oLevelDayFee;
    } else if (oLevelTuitionBoarderBill && oLevelBoarderFee) {
      formUpdates['oLevelAccommodationType'] = Residence.Boarder;
      if (this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...oLevelTuitionBoarderBill,
          fees: oLevelBoarderFee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
      this.currentOLevelAccommodationFee = oLevelBoarderFee;
    } else {
      formUpdates['oLevelAccommodationType'] = null; // No accommodation selected
    }

    const aLevelTuitionDayBill = findBillByFeeName(bills, 'aLevelTuitionDay');
    const aLevelTuitionBoarderBill = findBillByFeeName(
      bills,
      'aLevelTuitionBoarder'
    );
    const aLevelDayFee = findFee('aLevelTuitionDay');
    const aLevelBoarderFee = findFee('aLevelTuitionBoarder');

    if (aLevelTuitionDayBill && aLevelDayFee) {
      formUpdates['aLevelAccommodationType'] = Residence.Day;
      if (this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...aLevelTuitionDayBill,
          fees: aLevelDayFee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
      this.currentALevelAccommodationFee = aLevelDayFee;
    } else if (aLevelTuitionBoarderBill && aLevelBoarderFee) {
      formUpdates['aLevelAccommodationType'] = Residence.Boarder;
      if (this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...aLevelTuitionBoarderBill,
          fees: aLevelBoarderFee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
      this.currentALevelAccommodationFee = aLevelBoarderFee;
    } else {
      formUpdates['aLevelAccommodationType'] = null; // No accommodation selected
    }

    // Meal & Transport (checkboxes)
    const foodBill = findBillByFeeName(bills, 'foodFee');
    const foodFee = findFee('foodFee');
    if (foodBill && foodFee) {
      formUpdates['foodOption'] = true;
      if (this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...foodBill,
          fees: foodFee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
    }
    const transportBill = findBillByFeeName(bills, 'transportFee');
    const transportFee = findFee('transportFee');
    if (transportBill && transportFee) {
      formUpdates['transportOption'] = true;
      if (this.enrolment && this.enrolment.student)
        initialToBill.push({
          ...transportBill,
          fees: transportFee,
          student: this.enrolment.student,
          enrol: this.enrolment,
        });
    }

    // Patch form values without emitting events to prevent re-triggering subscriptions
    this.academicSettingsForm.patchValue(formUpdates, { emitEvent: false });
    // Filter initialToBill to ensure unique fees (in case deskFee logic caused temporary duplicates)
    this.toBill = Array.from(new Set(initialToBill.map((b) => b.fees.id))).map(
      (id) => initialToBill.find((b) => b.fees.id === id)!
    );

    // Manually trigger the combined accommodation subscription once after populating form
    // to ensure `showTransportFoodOptions` is correctly set.
    // This is important because `patchValue({ emitEvent: false })` bypasses `valueChanges`.
    this.accommodationTypeTrigger$.next();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enrolment'] && changes['enrolment'].currentValue) {
      if (this.enrolment?.name?.toLowerCase().includes('science')) {
        this.isScienceStudent = true;
      }
      if (this.enrolment?.student?.studentNumber) {
        const studentNumber = this.enrolment.student.studentNumber;
        this.store.dispatch(
          isNewComerActions.checkIsNewComer({ studentNumber })
        );
      }
      // If enrolment changes AND fees/selectedBills are already available, re-populate.
      // This handles the case where enrolment comes in after initial load.
      if (this.fees.length > 0 && this.selectedBills.length > 0) {
        this.populateFormAndToBillFromSelectedBills(this.selectedBills);
      } else if (this.fees.length > 0) {
        // If fees are loaded but no selected bills for new enrolment, reset form
        this.academicSettingsForm.reset(
          {
            selectedAcademicLevel: 'O Level',
            oLevelNewComer: false,
            aLevelNewComer: false,
            aLevelScienceLevy: false,
            oLevelAccommodationType: null,
            aLevelAccommodationType: null,
            foodOption: false,
            transportOption: false,
          },
          { emitEvent: false }
        );
        this.toBill = [];
        this.accommodationTypeTrigger$.next(); // Trigger to update UI based on reset
      }
    }
  }

  /**
   * Resets and removes bills associated with controls that are currently disabled
   * due to academic level selection.
   * @param activeLevel The academic level ('O Level' or 'A Level') that is currently active.
   */
  private resetDisabledControls(activeLevel: 'O Level' | 'A Level'): void {
    // Only remove specific bills if they are definitely tied to the disabled academic level
    // and if the related checkbox/radio is currently selected in the form.

    // Reset O Level specific fields if A Level is active
    if (activeLevel === 'A Level') {
      if (this.oLevelNewComer.value) {
        this.oLevelNewComer.setValue(false, { emitEvent: false });
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('oLevelApplicationFee'))!
        );
      }
      // Handle deskFee: remove if OLevelNewComer was true AND ALevelNewComer is false
      if (
        !this.aLevelNewComer.value &&
        this.toBill.some((b) => b.fees.name.includes('deskFee')) &&
        this.oLevelNewComer.value === false
      ) {
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('deskFee'))!
        );
      }

      if (this.oLevelAccommodationType.value) {
        this.oLevelAccommodationType.setValue(null, { emitEvent: false });
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('oLevelTuitionDay'))!
        );
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('oLevelTuitionBoarder'))!
        );
        this.currentOLevelAccommodationFee = undefined;
      }
    }
    // Reset A Level specific fields if O Level is active
    else if (activeLevel === 'O Level') {
      if (this.aLevelNewComer.value) {
        this.aLevelNewComer.setValue(false, { emitEvent: false });
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('aLevelApplicationFee'))!
        );
      }
      // Handle deskFee: remove if ALevelNewComer was true AND OLevelNewComer is false
      if (
        !this.oLevelNewComer.value &&
        this.toBill.some((b) => b.fees.name.includes('deskFee')) &&
        this.aLevelNewComer.value === false
      ) {
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('deskFee'))!
        );
      }
      if (this.aLevelScienceLevy.value) {
        this.aLevelScienceLevy.setValue(false, { emitEvent: false });
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('alevelScienceFee'))!
        );
      }
      if (this.aLevelAccommodationType.value) {
        this.aLevelAccommodationType.setValue(null, { emitEvent: false });
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('aLevelTuitionDay'))!
        );
        this.removeFeeFromToBill(
          this.fees.find((f) => f.name.includes('aLevelTuitionBoarder'))!
        );
        this.currentALevelAccommodationFee = undefined;
      }
    }
  }

  // --- Local Bill Management Methods (ONLY modify `toBill` array) ---

  /**
   * Adds a FeesModel to the `toBill` array if it's not already present.
   * Creates a new BillModel with student and enrolment data.
   * @param fee The FeesModel to add.
   */
  addFeeToToBill(fee: FeesModel): void {
    if (!this.enrolment?.student || !this.enrolment) {
      return;
    }

    // Check if a bill with this fee ID is already in `toBill`
    const existingBillIndex = this.toBill.findIndex(
      (b) => b.fees.id === fee.id
    );

    if (existingBillIndex === -1) {
      // Create a new bill object if it doesn't exist
      const newBill: BillModel = {
        student: this.enrolment.student,
        fees: fee,
        enrol: this.enrolment,
      };
      this.toBill.push(newBill);
    } else {
    }
  }

  /**
   * Removes a FeesModel from the `toBill` array.
   * @param fee The FeesModel to remove.
   */
  removeFeeFromToBill(fee: FeesModel): void {
    // Ensure fee.id exists before trying to find
    if (fee && fee.id !== undefined) {
      const billToRemoveIndex = this.toBill.findIndex(
        (b) => b.fees.id === fee.id
      );
      if (billToRemoveIndex !== -1) {
        this.toBill.splice(billToRemoveIndex, 1);
      } else {
      }
    } else {
    }
  }

  // --- Event Handlers for UI Buttons ---
  onSaveChanges(): void {
    if (this.academicSettingsForm.valid) {
      this.confirmBill(); // This will lead to `billStudent()` if confirmed
    } else {
      this.snackBar.open(
        'Please correct the form errors before saving.',
        'Close',
        {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
        }
      );
      this.academicSettingsForm.markAllAsTouched(); // Show validation errors
    }
  }

  onCancel(): void {
    this.snackBar.open('Changes cancelled.', 'Close', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
    });
    // Reset form and toBill to the initial state based on `selectedBills`
    this.populateFormAndToBillFromSelectedBills(this.selectedBills);
  }

  // --- Dialogs and Ngrx Dispatch ---
  billStudent(): void {
    // This action sends the FINAL `toBill` array to your Ngrx Effect and then backend
    if (!this.enrolment?.student) {
      this.snackBar.open(
        'Error: Student information missing for billing.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    this.store.dispatch(billStudentActions.billStudent({ bills: this.toBill }));

    // After dispatching, expect the Ngrx state to eventually update via a success action
    // (e.g., `billStudentSuccess`) from your effect, which will then trigger
    // `selectedStudentInvoice` subscription and re-populate the form/toBill.
  }

  confirmBill(): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px',
      data: {
        message: 'Are you sure you want to bill student with selected fees?',
        title: 'Confirm Billing',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.billStudent();
      }
    });
  }

  // `isSelected` remains for UI display logic (e.g., to indicate what's already on the invoice)
  isSelected(fee: FeesModel): boolean {
    return this.selectedBills.some(
      (selectedBill) => selectedBill.fees.id === fee.id
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
