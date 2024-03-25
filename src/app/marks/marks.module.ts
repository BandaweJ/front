import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterMarksComponent } from './enter-marks/enter-marks.component';
import { SubjectsComponent } from './subjects/subjects.component';
import { MaterialModule } from '../material/material.module';
import { StoreModule } from '@ngrx/store';
import { marksReducer } from './store/marks.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MarksEffects } from './store/marks.effects';
import { AddEditSubjectComponent } from './subjects/add-edit-subject/add-edit-subject.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PerfomanceComponent } from './perfomance/perfomance.component';
import { NgChartsModule } from 'ng2-charts';
import { TeachersCommentsComponent } from './teachers-comments/teachers-comments.component';

@NgModule({
  declarations: [
    EnterMarksComponent,
    SubjectsComponent,
    AddEditSubjectComponent,
    PerfomanceComponent,
    TeachersCommentsComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule,
    StoreModule.forFeature('marks', marksReducer),
    EffectsModule.forFeature(MarksEffects),
  ],
})
export class MarksModule {}
