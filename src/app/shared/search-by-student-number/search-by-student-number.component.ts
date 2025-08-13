import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { startWith, debounceTime, map, takeUntil } from 'rxjs/operators';
import { StudentsModel } from '../../registration/models/students.model';
import { Store, select } from '@ngrx/store';
import { selectStudents } from '../../registration/store/registration.selectors';

@Component({
  selector: 'app-student-search',
  templateUrl: './search-by-student-number.component.html',
  styleUrls: ['./search-by-student-number.component.css'],
})
export class StudentSearchComponent implements OnInit, OnDestroy {
  @Output() studentSelected = new EventEmitter<StudentsModel>();

  searchControl = new FormControl('');
  searchResults$: Observable<StudentsModel[]> = of([]);
  students$: Observable<StudentsModel[]> = this.store.pipe(
    select(selectStudents)
  );
  initialStudents: StudentsModel[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.students$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((students) => {
      this.initialStudents = students;
      // Perform initial filtering if needed with an empty search term
      this.searchResults$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        map((searchTerm) =>
          this.filterStudents(this.initialStudents, searchTerm)
        )
      );
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  filterStudents(
    students: StudentsModel[],
    searchTerm: string | null
  ): StudentsModel[] {
    if (!searchTerm?.trim()) {
      return students || [];
    }
    return (students || []).filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  selectStudent(student: StudentsModel) {
    this.studentSelected.emit(student);
    this.searchControl.setValue('');
    // this.searchResults$ = of([]);
  }

  displayFn(student: StudentsModel): string {
    return student && student.name
      ? `${student.name} ${student.surname} (${student.studentNumber})`
      : '';
  }
}
