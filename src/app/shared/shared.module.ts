import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentSearchComponent } from './search-by-student-number/search-by-student-number.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ReplaceUnderscoresPipe } from './pipes/replace-underscores.pipe';
import { GetUniqueTermNumbersPipe } from './pipes/get-unique-term-numbers.pipe';
import { GetUniqueTermYearsPipe } from './pipes/get-unique-term-years.pipe';
import { ConfirmationDialogComponent } from './confirmation-dialo/confirmation-dialo.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';

@NgModule({
  declarations: [
    StudentSearchComponent,
    ReplaceUnderscoresPipe,
    GetUniqueTermNumbersPipe,
    GetUniqueTermYearsPipe,
    ConfirmationDialogComponent,
    ConfirmDeleteDialogComponent,
  ],
  exports: [
    StudentSearchComponent,
    ReplaceUnderscoresPipe,
    GetUniqueTermNumbersPipe,
    GetUniqueTermYearsPipe,
    ConfirmDeleteDialogComponent,
  ],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class SharedModule {}
