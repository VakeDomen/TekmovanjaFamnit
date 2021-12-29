import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

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

  @Input() public series1: any[] = [];
  @Input() public series2: any[] = [];
  @Input() public labels: string[] = [];
  
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
    this.chartOptions.series[0].data = this.series1;
    this.chartOptions.series[1].data = this.series2;
    this.chartOptions.labels = this.labels;
  }
}
