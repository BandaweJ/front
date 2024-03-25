import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { enrolmentReducer } from './store/enrolment.reducer';
import { EnrolmentEffects } from './store/enrolment.effects';
import { TermsClassesComponent } from './terms-classes/terms-classes.component';
import { TermsComponent } from './terms-classes/terms/terms.component';
import { ClassesComponent } from './terms-classes/classes/classes.component';
import { AddEditClassComponent } from './terms-classes/classes/add-edit-class/add-edit-class.component';
import { AddEditTermComponent } from './terms-classes/terms/add-edit-term/add-edit-term.component';
import { EnrolStudentComponent } from './terms-classes/enrol-student/enrol-student.component';
import { MigrateClassEnrolmentComponent } from './migrate-class-enrolment/migrate-class-enrolment.component';

@NgModule({
  declarations: [TermsClassesComponent, TermsComponent, ClassesComponent, AddEditClassComponent, AddEditTermComponent, EnrolStudentComponent, MigrateClassEnrolmentComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    StoreModule.forFeature('enrol', enrolmentReducer),
    EffectsModule.forFeature([EnrolmentEffects]),
  ],
})
export class EnrolmentModule {}
