import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTeachers } from '../../store/registration.selectors';
import { TeachersModel } from '../../models/teachers.model';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-teacher-view',
  templateUrl: './teacher-view.component.html',
  styleUrls: ['./teacher-view.component.css'],
})
export class TeacherViewComponent implements OnInit {
  teacherId!: string;
  teacher!: TeachersModel | undefined;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public title: Title
  ) {
    this.teacherId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.store.select(selectTeachers).subscribe((teachers) => {
      this.teacher = teachers.find((tr) => tr.id === this.teacherId);
    });
  }

  calculateAge(dateOfBirth: string | undefined): number | undefined {
    if (!dateOfBirth) {
      return undefined; // Handle cases where date of birth is not provided
    }

    const birthDate =
      typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;

    if (isNaN(birthDate.getTime())) {
      return undefined; // Handle invalid date strings
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
