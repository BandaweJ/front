import { Component, OnInit, ViewChild } from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartType,
} from 'chart.js';
import { Observable } from 'rxjs';
import { SubjectsModel } from '../models/subjects.model';
import { MarksModel } from '../models/marks.model';
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
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
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

  constructor(private store: Store) {
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
    });

    this.subjectForm = new FormGroup({
      subj: new FormControl(''),
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

  plotSubjectPerf() {
    console.log('subject info');
    const sub = this.subj?.value;
    console.log(sub);
    const index = this.subjects.indexOf(this.subj?.value);
    console.log(index);
    // this.store.dispatch(perfomanceActions.plotSubjectPerf({ subject, index }));
    // this.chart.update();
  }

  get term() {
    return this.perfForm.get('term');
  }

  get clas() {
    return this.perfForm.get('clas');
  }

  get subj() {
    return this.subjectForm.get('subj');
  }

  getPerfData() {
    if (this.perfForm.valid) {
      const term: TermsModel = this.term?.value;
      const clas = this.clas?.value;

      this.store.dispatch(
        perfomanceActions.fetchPerfomanceData({
          num: term.num,
          year: term.year,
          name: clas,
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
