import { Component, Input, OnChanges, SimpleChanges, } from "@angular/core";

import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexLegend,
  ApexResponsive,
  ChartComponent
} from "ng-apexcharts";
import { Match } from "src/app/models/match.model";
import { Submission } from "src/app/models/submission.model";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-submission-win-rate-chart',
  templateUrl: './submission-win-rate-chart.component.html',
  styleUrls: ['./submission-win-rate-chart.component.sass']
})
export class SubmissionWinRateChartComponent implements OnChanges {

  private MAX_RADIALS: number = 4;

  @Input() public submissions: Submission[] | undefined;
  @Input() public matches: Match[] | undefined;

  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [],
      chart: {
        height: 390,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: "30%",
            background: "transparent",
            image: undefined
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show: false
            }
          }
        }
      },
      colors: ["#1ab7ea", "#0084ff", "#39539E", "#0077B5"],
      labels: [],
      legend: {
        show: true,
        floating: true,
        fontSize: "16px",
        position: "left",
        offsetX: -30,
        offsetY: 10,
        labels: {
          useSeriesColors: true
        },
        formatter: function(seriesName, opts) {
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
        },
        itemMargin: {
          horizontal: 3
        }
      },
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.submissions)  {
      return;
    }
    let i = 0;
    while (this.chartOptions.series.length < this.MAX_RADIALS && i < this.submissions.length) {
      const label = `Version ${this.submissions[i].version}`;
      const value = this.getWinRate(i);

      if (value != -1) {
        this.chartOptions.labels.push(label);
        this.chartOptions.series.push(value);
      }
      i++;
    }
  }  

  private getWinRate(index: number): number {
    if (
      !this.submissions || 
      !this.submissions.length || 
      index >= this.submissions.length || 
      !this.matches || 
      !this.matches.length
    ) {
      return -1;
    }
    const sub = this.submissions[index];
    let wins = 0;
    let losses = 0;
    for (const match of this.matches) {
      if (match.submission_id_1 == sub.id) {
        if (match.submission_id_2 != match.submission_id_winner) {
          wins++;
        } else {
          losses++;
        }
      }
    }
    if (wins == 0 && losses == 0) {
      return -1;
    }
    return Math.round(wins / (wins + losses) * 100);
  }


}
