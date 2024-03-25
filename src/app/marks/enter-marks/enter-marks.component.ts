import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from '../../enrolment/models/classes.model';
import { EnrolsModel } from '../../enrolment/models/enrols.model';
import { TermsModel } from '../../enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
  getEnrolmentByClass,
} from '../../enrolment/store/enrolment.actions';
import { MatTableDataSource } from '@angular/material/table';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
} from '../../enrolment/store/enrolment.selectors';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MarksModel } from '../models/marks.model';
import { SubjectsModel } from '../models/subjects.model';
import {
  fetchSubjectMarksInClass,
  fetchSubjects,
  saveMarkAction,
  deleteMarkActions,
} from '../store/marks.actions';
import { selectMarks, selectSubjects } from '../store/marks.selectors';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-enter-marks',
  templateUrl: './enter-marks.component.html',
  styleUrls: ['./enter-marks.component.css'],
})
export class EnterMarksComponent implements OnInit, AfterViewInit {
  classes$!: Observable<ClassesModel[]>;
  terms$!: Observable<TermsModel[]>;
  subjects$!: Observable<SubjectsModel[]>;
  private errorMsg$!: Observable<string>;
  enrolForm!: FormGroup;
  public dataSource = new MatTableDataSource<MarksModel>();
  marksForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private store: Store, public title: Title) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchSubjects());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    this.subjects$ = this.store.select(selectSubjects);

    this.store.select(selectMarks).subscribe((marks) => {
      this.dataSource.data = marks;
      // console.log(marks[0]);
    });

    this.enrolForm = new FormGroup({
      clas: new FormControl('', [Validators.required]),
      term: new FormControl('', [Validators.required]),
      subject: new FormControl('', Validators.required),
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get clas() {
    return this.enrolForm.get('clas');
  }

  get term() {
    return this.enrolForm.get('term');
  }

  get subject() {
    return this.enrolForm.get('subject');
  }

  displayedColumns = [
    'studentNumber',
    'surname',
    'name',
    'gender',
    'mark',
    // 'comment',
    'action',
  ];

  fetchClassList() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;
    const subject: SubjectsModel = this.subject?.value;

    const num = term.num;
    const year = term.year;
    const subjectCode = subject.code;

    // console.log(`Name: ${name}, Num: ${num}, Year: ${year}`);
    this.store.dispatch(
      fetchSubjectMarksInClass({ name, num, year, subjectCode })
    );
  }

  saveMark(mark: MarksModel, mrk: string, cmmnt: string) {
    if (mrk && cmmnt) {
      mark = {
        ...mark,
        mark: Number(mrk),
        comment: cmmnt,
        year: Number(mark.year),
        num: Number(mark.num),
      };

      this.store.dispatch(saveMarkAction({ mark }));
      // console.log('Mark', mark);
    }
  }

  deleteMark(mark: MarksModel) {
    if (mark.id) {
      this.store.dispatch(deleteMarkActions.deleteMark({ mark }));
    }
  }
}
