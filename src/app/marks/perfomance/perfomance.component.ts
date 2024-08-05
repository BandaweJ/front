import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';

import { Store } from '@ngrx/store';
import { selectLineChartData, selectPerfData } from '../store/marks.selectors';
import { perfomanceActions } from '../store/marks.actions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import { BaseChartDirective } from 'ng2-charts';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { Title } from '@angular/platform-browser';
import { ExamType } from '../models/examtype.enum';
// import { SubjectsModel } from 'src/app/marks/models/subjects.model';

@Component({
  selector: 'app-perfomance',
  templateUrl: './perfomance.component.html',
  styleUrls: ['./perfomance.component.css'],
})
export class PerfomanceComponent implements OnInit {
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };
  perfForm!: FormGroup;
  subjectForm!: FormGroup;
  classes$ = this.store.select(selectClasses);
  terms$ = this.store.select(selectTerms);
  subjects!: string[];
  @ViewChild(BaseChartDirective)
  public chart!: BaseChartDirective;
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  constructor(private store: Store, public title: Title) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    // this.chart = new Chart(document.getElementById('myChart'), this.lineChartData);
    this.store.select(selectLineChartData).subscribe((d) => {
      this.lineChartData.labels = d.labels;
      this.lineChartData.datasets = d.datasets;
      this.subjects = [...this.fillLabels(d)];
      this.chart && this.chart.update();
    });

    this.perfForm = new FormGroup({
      term: new FormControl(null, [Validators.required]),
      clas: new FormControl(null, [Validators.required]),
      examType: new FormControl('', Validators.required),
    });
  }

  fillLabels(d: ChartConfiguration<'line'>['data']): string[] {
    const newArray: string[] = [];
    for (const dataset of d.datasets) {
      if (dataset.label) newArray.push(dataset.label);
    }
    // console.log(newArray);
    return newArray;
  }

  // plotSubjectPerf() {

  //   const index = this.subjects.indexOf(this.subj?.value);
  //   console.log(index);
  //   // this.store.dispatch(perfomanceActions.plotSubjectPerf({ subject, index }));
  //   // this.chart.update();
  // }

  get term() {
    return this.perfForm.get('term');
  }

  get clas() {
    return this.perfForm.get('clas');
  }

  get examType() {
    return this.perfForm.get('examType');
  }

  getPerfData() {
    if (this.perfForm.valid) {
      const term: TermsModel = this.term?.value;
      const clas = this.clas?.value;
      const examType = this.examType?.value;

      this.store.dispatch(
        perfomanceActions.fetchPerfomanceData({
          num: term.num,
          year: term.year,
          name: clas,
          examType: examType,
        })
      );
    }
  }

  // public lineChartOptions: ChartConfiguration<'line'> = {
  //   responsive: true,
  // };

  public chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            console.log(tooltipItem);
          },
        },
      },
    },
  };

  public lineChartLegend = true;
}
