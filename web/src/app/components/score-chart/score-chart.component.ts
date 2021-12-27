import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Match } from 'src/app/models/match.model';
import { Submission } from 'src/app/models/submission.model';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexPlotOptions,
  ApexXAxis
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  labels: string[];
  fill: ApexFill,
  stroke: any; // ApexStroke;
  dataLabels: any; // ApexDataLabels;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-score-chart',
  templateUrl: './score-chart.component.html',
  styleUrls: ['./score-chart.component.sass']
})
export class ScoreChartComponent implements OnChanges {

  @Input() public submissions: Submission[] | undefined;
  @Input() public matches: Match[] | undefined;

  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [
        {
          name: "Round",
          type: "column",
          data: []
        },
        {
          name: "Total score",
          type: "line",
          data: []
        }
      ],
      chart: {
        height: 350,
        type: "line"
      },
      stroke: {
        width: [0, 4]
      },
      fill: {
        type: ['solid']
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [1]
      },
      labels: [],
      xaxis: {},
      plotOptions: {
        bar: {
          colors: {
            ranges: [
              {
                from: -1000,
                to: 0,
                color: "#F15B46"
              }
            ]
          },
          columnWidth: "80%"
        }
      },
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.submissions || !this.submissions.length || !this.matches || !this.matches.length) {
      return;
    }
    const roundData: any = {};
    this.matches.sort((m1: Match, m2: Match) => m1.round < m2.round ? -1 : 1);
    for (const match of this.matches) {
      if (!match.round) {
        continue;
      }
      if (!roundData[match.round]) {
        roundData[match.round] = {};
        roundData[match.round].score = 0;
        roundData[match.round].roundScore = 0;
      }
      if (match.submission_id_1 == match.submission_id_winner) {
        roundData[match.round].roundScore++;
      } else {
        roundData[match.round].roundScore--;
      }
    }
    let prev = 0;
    for (const rdi in roundData) {
      roundData[rdi].score = prev + roundData[rdi].roundScore;
      prev = roundData[rdi].score;
    }
    for (const rdi in roundData) {
      this.chartOptions.labels.push(rdi);
      this.chartOptions.series[0].data.push(roundData[rdi].roundScore);
      this.chartOptions.series[1].data.push(roundData[rdi].score);
    }
  }
}
