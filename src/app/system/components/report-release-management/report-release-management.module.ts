import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportReleaseManagementComponent } from './report-release-management.component';
import { GenerateSessionsDialogComponent } from './generate-sessions-dialog/generate-sessions-dialog.component';
import { BulkUpdateDialogComponent } from './bulk-update-dialog/bulk-update-dialog.component';
import { EditReleaseDialogComponent } from './edit-release-dialog/edit-release-dialog.component';

@NgModule({
  declarations: [
    ReportReleaseManagementComponent,
    GenerateSessionsDialogComponent,
    BulkUpdateDialogComponent,
    EditReleaseDialogComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ReportReleaseManagementComponent,
  ],
})
export class ReportReleaseManagementModule {}
