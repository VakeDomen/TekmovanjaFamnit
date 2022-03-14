import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexFill,
  ApexStroke,
  ApexMarkers
} from "ng-apexcharts";
import { Match } from 'src/app/models/match.model';
import { Submission } from 'src/app/models/submission.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  xaxis: ApexXAxis;
};

@Component({
  selector: 'app-radar-stats-chart',
  templateUrl: './radar-stats-chart.component.html',
  styleUrls: ['./radar-stats-chart.component.sass']
})
export class RadarStatsChartComponent implements OnChanges {
  
  @Input() series: any[] = [];
  
  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "radar",
        dropShadow: {
          enabled: true,
          blur: 1,
          left: 1,
          top: 1
        }
      },
      stroke: {
        width: 0
      },
      fill: {
        opacity: 0.4
      },
      markers: {
        size: 0
      },
      xaxis: {
        categories: ["Total number of fleets", ["Enemy fleet", "size"], ["Number of", "enemy fleets"], "Total fleet size",  ["My fleet", "size"], ["Number of", "my fleets"]]
      }
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.chartOptions.series = this.series;
  }
}
