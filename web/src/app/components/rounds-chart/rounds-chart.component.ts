import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexPlotOptions,
  ApexXAxis,
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
  selector: 'app-rounds-chart',
  templateUrl: './rounds-chart.component.html',
  styleUrls: ['./rounds-chart.component.sass']
})
export class RoundsChartComponent implements OnChanges {

  MAX_DISPLAY_ROUNDS = 60;

  @Input() public series1: any[] = [];
  @Input() public labels: string[] = [];
  
  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [
        {
          name: "Round",
          type: "column",
          data: []
        }
      ],
      chart: {
        height: 350,
        type: "line",
        animations: {
          enabled: true,
        },
        zoom: {
          enabled: true,
          type: 'x',  
          autoScaleYaxis: true,  
      }
      },
      stroke: {
        width: [0, 4]
      },
      fill: {
        type: ['solid']
      },
      dataLabels: {
        enabled: false,
        enabledOnSeries: [1]
      },
      labels: [],
      xaxis: {
        tickAmount: this.MAX_DISPLAY_ROUNDS / 5,
      },
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
    this.chartOptions.series[0].data = this.series1.slice(-this.MAX_DISPLAY_ROUNDS);
    this.chartOptions.labels = this.labels.slice(-this.MAX_DISPLAY_ROUNDS);
  }
}