import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
import { SharedService } from 'src/app/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-invoice-item',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './invoice-item.component.html',
  styleUrls: ['./invoice-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceItemComponent implements OnInit, OnChanges, OnDestroy {
  currentTheme: Theme = 'light';
  isDownloading = false;
  private destroy$ = new Subject<void>();

  @Input() invoice!: InvoiceModel | null;
  @Input() downloadable!: boolean;

  constructor(
    public sharedService: SharedService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice'] || changes['downloadable']) {
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (!this.invoice) {
      return;
    }
    this.store.dispatch(invoiceActions.saveInvoice({ invoice: this.invoice }));
  }

  download(): void {
    if (!this.invoice?.invoiceNumber) {
      console.warn('Cannot download invoice: Invoice number is missing.');
      return;
    }
    this.isDownloading = true;
    this.store.dispatch(
      invoiceActions.downloadInvoice({
        invoiceNumber: this.invoice.invoiceNumber,
      })
    );
    // Reset loading state after a delay (actual download handled by effect)
    setTimeout(() => {
      this.isDownloading = false;
      this.cdr.markForCheck();
    }, 2000);
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'paid':
        return 'status-paid';
      case 'pending':
      case 'partially paid':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-default';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '../../../assets/placeholder-logo.png';
    }
  }
}
