import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDeleteDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.css']
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData
  ) {
    // Set defaults
    this.data.confirmText = this.data.confirmText || 'Delete';
    this.data.cancelText = this.data.cancelText || 'Cancel';
    this.data.type = this.data.type || 'warning';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'danger':
        return 'error';
      case 'info':
        return 'info';
      case 'warning':
      default:
        return 'warning';
    }
  }

  getColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'info':
        return 'primary';
      case 'warning':
      default:
        return 'accent';
    }
  }
}
