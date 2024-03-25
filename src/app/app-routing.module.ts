import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { ParentsListComponent } from './registration/parents-list/parents-list.component';
import { StudentsListComponent } from './registration/students-list/students-list.component';
import { TeachersListComponent } from './registration/teachers-list/teachers-list.component';
import { TermsClassesComponent } from './enrolment/terms-classes/terms-classes.component';
import { TermsComponent } from './enrolment/terms-classes/terms/terms.component';
import { ClassesComponent } from './enrolment/terms-classes/classes/classes.component';
import { SubjectsComponent } from './marks/subjects/subjects.component';
import { EnterMarksComponent } from './marks/enter-marks/enter-marks.component';
import { PerfomanceComponent } from './marks/perfomance/perfomance.component';
import { ReportsComponent } from './reports/reports/reports.component';
import { MarkRegisterComponent } from './attendance/mark-register/mark-register.component';
import { MigrateClassEnrolmentComponent } from './enrolment/migrate-class-enrolment/migrate-class-enrolment.component';
import { TeachersCommentsComponent } from './marks/teachers-comments/teachers-comments.component';

const routes: Routes = [
  { path: 'signin', component: SigninComponent, title: 'Sign In' },
  { path: 'signup', component: SignupComponent, title: 'Sign Up' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard',
    canActivate: [AuthGuardService],
  },
  {
    path: 'teachers',
    component: TeachersListComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Teachers',
  },
  {
    path: 'students',
    component: StudentsListComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Students',
  },
  {
    path: 'classes',
    component: ClassesComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Classes',
  },
  {
    path: 'terms',
    component: TermsComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Terms',
  },
  {
    path: 'enrol',
    component: TermsClassesComponent,
    canActivate: [AuthGuardService],
    title: 'Enrol Students',
  },
  {
    path: 'migrate-class',
    component: MigrateClassEnrolmentComponent,
    canActivate: [AuthGuardService],
    title: 'Migrate Class Enrolment',
  },
  {
    path: 'subjects',
    component: SubjectsComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Subjects',
  },
  {
    path: 'input',
    component: EnterMarksComponent,
    canActivate: [AuthGuardService],
    title: 'Enter Marks',
  },
  {
    path: 'perfomance',
    component: PerfomanceComponent,
    canActivate: [AuthGuardService],
    title: 'Student Perfomance',
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuardService],
    title: 'Progress Reports',
  },
  {
    path: 'mark-register',
    component: MarkRegisterComponent,
    canActivate: [AuthGuardService],
    title: 'Mark Attendance Register',
  },
  {
    path: 'teachers-comments',
    component: TeachersCommentsComponent,
    canActivate: [AuthGuardService],
    title: 'Teacher Comments',
  },
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: DashboardComponent,
  },
  // {
  //   //   path: 'registration',
  //   //   component: RegistrationComponent,
  //   //   canActivate: [AuthGuardService],
  //   //   children: [
  //   //     {
  //   //       path: 'parents',
  //   //       component: ParentsListComponent,
  //   //     },
  //   //     {
  //   //       path: 'students',
  //   //       component: StudentsListComponent,
  //   //     },
  //   //     {
  //   //       path: 'teachers',
  //   //       component: TeachersListComponent,
  //   //     },
  //   //   ],
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
