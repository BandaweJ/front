import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatAutocompleteModule,
    NgChartsModule,
  ],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.scss'],
})
export class ParentDashboardComponent {
  summaryLoading$: Observable<boolean> = of(false);
  summaryError$: Observable<string | null> = of(null);
  linkedChildren$: Observable<any[]> = of([]);
  selectedChildIndex$ = new BehaviorSubject<number>(0);
  selectedChildSummary$: Observable<any | null> = of(null);
  performanceChartData$: Observable<any[]> = of([]);
  studentMarksLoading$: Observable<boolean> = of(false);

  caLoading = false;
  caAnalytics: any = null;
  marksInsights: any = null;
  marksDataSource = new MatTableDataSource<any>([]);
  marksDisplayedColumns = ['subject', 'term', 'year', 'mark', 'examType'];

  lineChartOptions: any = { responsive: true };
  lineChartType: 'line' = 'line';

  retrySummary(): void {
    // Placeholder keeps dashboard build-safe while data hooks are restored.
  }

  onChildTabChange(event: { index: number }): void {
    this.selectedChildIndex$.next(event?.index ?? 0);
  }

  buildParentAdvisory(_: any): string {
    return 'Review finance and report trends for each child regularly.';
  }
}
