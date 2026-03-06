import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentsModel } from '../../models/parents.model';
import { ParentsService } from '../../services/parents.service';
import { StudentsService } from '../../services/students.service';
import { StudentsModel } from '../../models/students.model';

@Component({
  selector: 'app-link-students-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Link students to {{ data.parent.title }} {{ data.parent.surname }}</h2>
    <mat-dialog-content>
      <p class="hint">Select the children linked to this parent. They will be able to view finances and reports for these students when logged in.</p>
      <div class="loading" *ngIf="loadingStudents">Loading students...</div>
      <div class="list" *ngIf="!loadingStudents && students.length">
        <label *ngFor="let s of students" class="student-row">
          <mat-checkbox
            [checked]="selected.has(s.studentNumber)"
            (change)="toggle(s.studentNumber, $event.checked)">
          </mat-checkbox>
          <span>{{ s.studentNumber }} – {{ s.name }} {{ s.surname }}</span>
        </label>
      </div>
      <p *ngIf="!loadingStudents && !students.length">No students found.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="save()"
        [disabled]="saving">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .hint { margin-bottom: 16px; color: rgba(0,0,0,0.6); font-size: 14px; }
      .loading { padding: 16px; }
      .list { max-height: 360px; overflow-y: auto; }
      .student-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer; }
      .student-row span { flex: 1; }
    `,
  ],
})
export class LinkStudentsDialogComponent implements OnInit {
  students: StudentsModel[] = [];
  selected = new Set<string>();
  loadingStudents = true;
  saving = false;

  constructor(
    private parentsService: ParentsService,
    private studentsService: StudentsService,
    private dialogRef: MatDialogRef<LinkStudentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parent: ParentsModel },
  ) {
    const linked = data.parent.students || [];
    linked.forEach((s) => this.selected.add(s.studentNumber));
  }

  ngOnInit(): void {
    this.studentsService.getAllStudents().subscribe({
      next: (list) => {
        this.students = list;
        this.loadingStudents = false;
      },
      error: () => {
        this.loadingStudents = false;
      },
    });
  }

  toggle(studentNumber: string, checked: boolean): void {
    if (checked) this.selected.add(studentNumber);
    else this.selected.delete(studentNumber);
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.parentsService
      .setLinkedStudents(this.data.parent.email, Array.from(this.selected))
      .subscribe({
        next: (updated) => {
          this.dialogRef.close(updated);
        },
        error: () => {
          this.saving = false;
        },
      });
  }
}
