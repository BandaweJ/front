import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { FinanceDataModel } from '../../models/finance-data.model'; // Make sure this path is correct
import { FinanceSearchService } from 'src/app/finance/services/finance-search.service';

@Component({
  selector: 'app-search-finance-entity',
  templateUrl: './search-finance-entity.component.html',
  styleUrls: ['./search-finance-entity.component.css'],
})
export class SearchFinanceEntityComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  filteredEntities$!: Observable<FinanceDataModel[]>;

  @Output()
  entitySelected = new EventEmitter<FinanceDataModel>();

  private ngUnsubscribe = new Subject<void>();

  constructor(private financeSearchService: FinanceSearchService) {}

  ngOnInit(): void {
    this.filteredEntities$ = this.searchControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      debounceTime(300),
      distinctUntilChanged(),
      // Filter for non-empty queries of at least 3 characters
      filter(
        (query): query is string => query != null && query.trim().length >= 3
      ),
      switchMap((query: string) =>
        this.financeSearchService.searchFinancialEntities(query.trim())
      )
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Called when an option from the autocomplete is selected.
   * Emits the selected entity to the parent component.
   * @param event MatAutocompleteSelectedEvent containing the selected option
   */
  onOptionSelected(event: any): void {
    const selectedEntity: FinanceDataModel = event.option.value;
    this.entitySelected.emit(selectedEntity);
    // Optionally clear the search input after selection
    this.searchControl.setValue('');
  }

  /**
   * Displays the entity's primary identifier in the autocomplete input after selection.
   * This is what shows up in the text box once an option is picked.
   * @param entity The FinanceDataModel object.
   * @returns A string to display in the input.
   */
  displayFn(entity: FinanceDataModel): string {
    if (!entity) {
      return '';
    }
    // Customize what appears in the search box after selection
    if (entity.type === 'Invoice' && entity.invoiceNumber) {
      return `Invoice: ${entity.invoiceNumber} - ${entity.studentName || ''}`;
    } else if (entity.type === 'Payment' && entity.receiptNumber) {
      return `Receipt: ${entity.receiptNumber} - ${entity.studentName || ''}`;
    }
    // Fallback to description or a generic ID if specific details aren't present
    return entity.description || entity.id || '';
  }
}
