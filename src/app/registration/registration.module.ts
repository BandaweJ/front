import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { TeachersListComponent } from './teachers-list/teachers-list.component';
import { ParentsListComponent } from './parents-list/parents-list.component';
import { StudentsListComponent } from './students-list/students-list.component';
import { TeachersService } from './services/teachers.service';
import { StoreModule } from '@ngrx/store';
import { registrationReducer } from './store/registration.reducer';
import { EffectsModule } from '@ngrx/effects';
import { RegistrationEffects } from './store/registration.effects';
import { AddEditTeacherComponent } from './teachers-list/add-edit-teacher/add-edit-teacher.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AddEditStudentComponent } from './students-list/add-edit-student/add-edit-student.component';
import { StudentsService } from './services/students.service';

@NgModule({
  declarations: [
    TeachersListComponent,
    ParentsListComponent,
    StudentsListComponent,
    AddEditTeacherComponent,
    AddEditStudentComponent,
    AddEditStudentComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    StoreModule.forFeature('reg', registrationReducer),
    EffectsModule.forFeature([RegistrationEffects]),
  ],
  providers: [TeachersService, StudentsService],
})
export class RegistrationModule {}
