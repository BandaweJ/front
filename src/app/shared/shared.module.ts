import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentSearchComponent } from './search-by-student-number/search-by-student-number.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [StudentSearchComponent],
  exports: [StudentSearchComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class SharedModule {}
