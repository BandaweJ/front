import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { ExamType } from '../models/examtype.enum';
import {
  fetchMarksProgressActions,
  fetchSubjectMarksInClass,
} from '../store/marks.actions';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { SubjectsModel } from '../models/subjects.model';
import { MarksProgressModel } from '../models/marks-progress.model';
import { selectMarksProgress } from '../store/marks.selectors';
import { selectIsLoading } from '../marks-sheets/store/selectors';

@Component({
  selector: 'app-marks-progress',
  templateUrl: './marks-progress.component.html',
  styleUrls: ['./marks-progress.component.css'],
})
export class MarksProgressComponent implements OnInit {
  constructor(public title: Title, private store: Store) {}

  marksProgressForm!: FormGroup;
  isLoading = this.store.select(selectIsLoading);
  terms$ = this.store.select(selectTerms);
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  classes$ = this.store.select(selectClasses);
  progressData$ = this.store.select(selectMarksProgress);

  dataSource = new MatTableDataSource<MarksProgressModel>();
  displayedColumns: string[] = [
    'code',
    'subject',
    // 'className',
    // 'teacherName',
    'totalStudents',
    'marksEntered',
    'progress',
  ];

  ngOnInit() {
    this.marksProgressForm = new FormGroup({
      term: new FormControl('', Validators.required),
      examType: new FormControl('', Validators.required),
      clas: new FormControl('', Validators.required),
    });

    this.progressData$.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  get term() {
    return this.marksProgressForm.get('term');
  }

  get examType() {
    return this.marksProgressForm.get('examType');
  }
  get clas() {
    return this.marksProgressForm.get('clas');
  }

  fetchProgressData() {
    // this.dataSource.data = data;

    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;

    const clas = this.clas?.value;

    const examType = this.examType?.value;

    this.store.dispatch(
      fetchMarksProgressActions.fetchMarksProgress({
        num,
        year,
        clas,
        examType,
      })
    );
    console.log(
      'dispatched  marks progress with values ',
      num,
      year,
      clas,
      examType
    );
  }
}
