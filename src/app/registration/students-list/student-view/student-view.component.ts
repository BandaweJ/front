import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { StudentsModel } from '../../models/students.model';
import { selectStudents } from '../../store/registration.selectors';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-student-view',
  templateUrl: './student-view.component.html',
  styleUrls: ['./student-view.component.css'],
})
export class StudentViewComponent implements OnInit {
  studentId!: string;
  student!: StudentsModel | undefined;
  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public title: Title,
    public sharedService: SharedService
  ) {
    this.studentId = this.route.snapshot.params['studentNumber'];
  }

  ngOnInit(): void {
    this.store.select(selectStudents).subscribe((students) => {
      this.student = students.find((st) => st.studentNumber === this.studentId);
    });
  }
}
