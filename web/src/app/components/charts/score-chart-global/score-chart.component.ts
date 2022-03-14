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
import { ChartService } from 'src/app/services/chart.service';

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
  selector: 'app-score-chart-global',
  templateUrl: './score-chart.component.html',
  styleUrls: ['./score-chart.component.sass']
})
export class ScoreChartGlobalComponent implements OnChanges {

  MAX_DISPLAY_ROUNDS = 60;

  @Input() public series: any[] = [];
  @Input() public labels: string[] = [];
  @Input() public annotations: any[] = []; 
  
  public chartOptions: ChartOptions;

  constructor(
    private chartService: ChartService,
  ) { 
    this.chartOptions = {
      series: [
        {
          name: "Score",
          data: []
        },
      ],
      chart: {
        height: 700,
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
        //curve: "smooth"
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
      colors: this.chartService.getColors(),
      annotations: {
        points: [],
      }
    };
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.chartOptions.series = this.series;
    this.chartOptions.xaxis.categories = this.labels;
    this.chartOptions.annotations.points = this.annotations.sort((a1: any, a2: any) => +a1.x > +a2.x ? 1 : -1).filter((el: any) => +el.x >= +this.labels[0]);
  }
}