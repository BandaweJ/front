import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTeachers } from '../../store/registration.selectors';
import { TeachersModel } from '../../models/teachers.model';
import { Title } from '@angular/platform-browser';
import { SharedService } from 'src/app/shared.service';

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
    public title: Title,
    public sharedService: SharedService
  ) {
    this.teacherId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.store.select(selectTeachers).subscribe((teachers) => {
      this.teacher = teachers.find((tr) => tr.id === this.teacherId);
    });
  }
}
