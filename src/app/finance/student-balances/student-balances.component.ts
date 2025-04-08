import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StudentsModel } from 'src/app/registration/models/students.model';

@Component({
  selector: 'app-student-balances',
  templateUrl: './student-balances.component.html',
  styleUrls: ['./student-balances.component.css'],
})
export class StudentBalancesComponent {
  selectedStudent!: StudentsModel;
  constructor(public title: Title) {}

  getSelectedStudent(student: StudentsModel) {
    // console.log('student ', student.studentNumber);
    this.selectedStudent = student;
  }
}
