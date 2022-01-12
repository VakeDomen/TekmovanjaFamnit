import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexMarkers,
  ApexAnnotations
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  // dataLabels: ApexDataLabels;
  grid: ApexGrid;
  colors: string[],
  annotations: ApexAnnotations,
};

@Component({
  selector: 'app-score-chart',
  templateUrl: './score-chart.component.html',
  styleUrls: ['./score-chart.component.sass']
})
export class ScoreChartComponent implements OnChanges {

  MAX_DISPLAY_ROUNDS = 60;

  @Input() public series2: any[] = [];
  @Input() public labels: string[] = [];
  @Input() public annotations: any[] = []; 
  
  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [
        {
          name: "Score",
          data: []
        },
      ],
      chart: {
        height: 350,
        type: "line",
        animations: {
          enabled: false,
        },
        zoom: {
          enabled: true,
          type: 'x',  
          autoScaleYaxis: true,  
        },
      },
      stroke: {
        curve: "smooth"
      },
      // dataLabels: {
      //   enabled: false,
      //   enabledOnSeries: [1]
      // },
      xaxis: {
        tickAmount: this.MAX_DISPLAY_ROUNDS / 5,
        categories: []
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      colors: ["#50C878"],
      annotations: {
        points: [],
      }
    };
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.chartOptions.series[0].data = this.series2.slice(-this.MAX_DISPLAY_ROUNDS);
    this.chartOptions.xaxis.categories = this.labels.slice(-this.MAX_DISPLAY_ROUNDS);
    this.chartOptions.annotations.points = this.annotations.sort((a1: any, a2: any) => +a1.x > +a2.x ? 1 : -1).filter((el: any) => +el.x >= +this.labels[0]);
  }
}