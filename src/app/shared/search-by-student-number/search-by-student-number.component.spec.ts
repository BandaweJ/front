import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByStudentNumberComponent } from './search-by-student-number.component';

describe('SearchByStudentNumberComponent', () => {
  let component: SearchByStudentNumberComponent;
  let fixture: ComponentFixture<SearchByStudentNumberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchByStudentNumberComponent]
    });
    fixture = TestBed.createComponent(SearchByStudentNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
