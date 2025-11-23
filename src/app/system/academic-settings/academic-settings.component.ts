import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-academic-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './academic-settings.component.html',
  styleUrls: ['./academic-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicSettingsComponent implements OnInit, OnDestroy {
  academicSettingsForm: FormGroup;
  gradingSettingsForm: FormGroup;
  currentTheme: Theme = 'light';
  selectedTab = 0;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  // Grade scales
  gradeScales = [
    { value: 'percentage', label: 'Percentage (0-100)' },
    { value: 'letter', label: 'Letter Grades (A-F)' },
    { value: 'points', label: 'Points (0-7)' },
  ];

  // Academic levels
  academicLevels = ['O Level', 'A Level'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private title: Title,
    private cdr: ChangeDetectorRef
  ) {
    this.academicSettingsForm = this.fb.group({
      academicYearStart: ['', Validators.required],
      academicYearEnd: ['', Validators.required],
      defaultTermCount: [3, [Validators.required, Validators.min(1), Validators.max(4)]],
      allowTermOverlap: [false],
      minimumEnrollmentAge: [13, [Validators.min(0), Validators.max(25)]],
      maximumEnrollmentAge: [20, [Validators.min(0), Validators.max(25)]],
    });

    this.gradingSettingsForm = this.fb.group({
      gradeScale: ['percentage', Validators.required],
      passingGrade: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      excellentGrade: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
      showGradesToStudents: [true],
      showGradesToParents: [true],
      allowGradeOverrides: [false],
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Academic Settings');
    
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSettings(): void {
    // TODO: Load settings from backend
    // For now, set default values
    const currentYear = new Date().getFullYear();
    this.academicSettingsForm.patchValue({
      academicYearStart: `${currentYear}-01-01`,
      academicYearEnd: `${currentYear}-12-31`,
    });
  }

  onSaveAcademicSettings(): void {
    if (this.academicSettingsForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    // TODO: Save to backend
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Academic settings saved successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.cdr.markForCheck();
    }, 1000);
  }

  onSaveGradingSettings(): void {
    if (this.gradingSettingsForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    // TODO: Save to backend
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Grading settings saved successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.cdr.markForCheck();
    }, 1000);
  }

  onResetAcademicSettings(): void {
    if (!confirm('Are you sure you want to reset all academic settings to defaults?')) {
      return;
    }
    this.academicSettingsForm.reset();
    this.loadSettings();
  }

  onResetGradingSettings(): void {
    if (!confirm('Are you sure you want to reset all grading settings to defaults?')) {
      return;
    }
    this.gradingSettingsForm.reset({
      gradeScale: 'percentage',
      passingGrade: 50,
      excellentGrade: 80,
      showGradesToStudents: true,
      showGradesToParents: true,
      allowGradeOverrides: false,
    });
  }
}

