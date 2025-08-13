import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { StudentComment } from '../models/student-comment';
import { saveCommentActions } from '../store/marks.actions';
import { selectComments } from '../store/marks.selectors';
import { ExamType } from '../models/examtype.enum';

@Component({
  selector: 'app-teachers-comments',
  templateUrl: './teachers-comments.component.html',
  styleUrls: ['./teachers-comments.component.css'],
})
export class TeachersCommentsComponent implements OnInit, AfterViewInit {
  classes$!: Observable<ClassesModel[]>;
  terms$!: Observable<TermsModel[]>;
  commentsForm!: FormGroup;
  comments$!: Observable<EnrolsModel[]>;
  public dataSource = new MatTableDataSource<EnrolsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['studentNumber', 'surname', 'name', 'gender', 'comment'];
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  constructor(private store: Store, public title: Title) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
    // this.store.dispatch(fetchEnrols());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.comments$ = this.store.select(selectComments);

    this.commentsForm = new FormGroup({
      // comment: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      term: new FormControl('', Validators.required),
      examType: new FormControl('', Validators.required),
    });

    this.comments$.subscribe((comments) => {
      this.dataSource.data = comments;
    });
  }

  ngAfterViewInit() {
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
    return this.commentsForm.get('clas');
  }

  get term() {
    return this.commentsForm.get('term');
  }

  get examType() {
    return this.commentsForm.get('examType');
  }

  fetchClassList() {
    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;
    const examType = this.examType?.value;

    // console.log(`Name: ${name}, Num: ${num}, Year: ${year}`);
    this.store.dispatch(
      saveCommentActions.fetchClassComments({ name, num, year, examType })
    );
  }

  saveComment(comment: StudentComment, cmmnt: string) {
    // const clas = this.clas?.value;
    const term: TermsModel = this.term?.value;

    // const name = clas.name;
    const num = +term.num;
    const year = +term.year;
    const examType = this.examType?.value;

    // const comment: StudentComment = {
    //   student,
    //   comment: cmmnt,
    //   name: clas,
    //   num,
    //   year,
    // };

    comment = {
      ...comment,
      comment: cmmnt,
      num: +term.num,
      year: +term.year,
      examType: examType,
    };

    this.store.dispatch(saveCommentActions.saveComment({ comment }));
  }
}
