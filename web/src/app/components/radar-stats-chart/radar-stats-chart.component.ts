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
  
  @Input() public submissions: Submission[] | undefined;
  @Input() public matches: Match[] | undefined;
  
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
    if (!this.submissions || !this.submissions.length || !this.matches || !this.matches.length) {
      return;
    }
    const assocArrayOfSubmissionData: any = {};

    for (const match of this.matches) {
      if (match.additional_data) {
        let data;
        try {
          data = JSON.parse(match.additional_data);
        } catch {
          continue;
        }

      }
    }
    this.matches.forEach((match: Match) => {
      if (!match.additional_data) {
        return;
      }
      let data;
      try {
        data = JSON.parse(match.additional_data);
      } catch {
        return;
      }
      if (!assocArrayOfSubmissionData[match.submission_id_1]) {
        assocArrayOfSubmissionData[match.submission_id_1] = {};
        assocArrayOfSubmissionData[match.submission_id_1].myFleetSize = [];
        assocArrayOfSubmissionData[match.submission_id_1].hisFleetSize = [];
        assocArrayOfSubmissionData[match.submission_id_1].numFleetsMine = [];
        assocArrayOfSubmissionData[match.submission_id_1].FleetsTotalSize = [];
        assocArrayOfSubmissionData[match.submission_id_1].numFleetsHis = [];
        assocArrayOfSubmissionData[match.submission_id_1].numFleetsTotal = [];
      }
      assocArrayOfSubmissionData[match.submission_id_1].myFleetSize.push(data.myFleetSize);
      assocArrayOfSubmissionData[match.submission_id_1].hisFleetSize.push(data.hisFleetSize);
      assocArrayOfSubmissionData[match.submission_id_1].numFleetsMine.push(data.numFleetsMine);
      assocArrayOfSubmissionData[match.submission_id_1].FleetsTotalSize.push(data.FleetsTotalSize);
      assocArrayOfSubmissionData[match.submission_id_1].numFleetsHis.push(data.numFleetsHis);
      assocArrayOfSubmissionData[match.submission_id_1].numFleetsTotal.push(data.numFleetsTotal);
    });
    for (const index in assocArrayOfSubmissionData) {
      assocArrayOfSubmissionData[index].myFleetSize = assocArrayOfSubmissionData[index].myFleetSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / assocArrayOfSubmissionData[index].myFleetSize.length;
      assocArrayOfSubmissionData[index].hisFleetSize = assocArrayOfSubmissionData[index].hisFleetSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / assocArrayOfSubmissionData[index].hisFleetSize.length;
      assocArrayOfSubmissionData[index].numFleetsMine = assocArrayOfSubmissionData[index].numFleetsMine.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / assocArrayOfSubmissionData[index].numFleetsMine.length;
      assocArrayOfSubmissionData[index].FleetsTotalSize = assocArrayOfSubmissionData[index].FleetsTotalSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / assocArrayOfSubmissionData[index].FleetsTotalSize.length;
      assocArrayOfSubmissionData[index].numFleetsHis = assocArrayOfSubmissionData[index].numFleetsHis.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / assocArrayOfSubmissionData[index].numFleetsHis.length;
      assocArrayOfSubmissionData[index].numFleetsTotal = assocArrayOfSubmissionData[index].numFleetsTotal.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / assocArrayOfSubmissionData[index].numFleetsTotal.length;
      this.chartOptions.series.push({
        name: `V${this.findVersion(index)}`,
        data: [
          assocArrayOfSubmissionData[index].numFleetsTotal,
          assocArrayOfSubmissionData[index].hisFleetSize,
          assocArrayOfSubmissionData[index].numFleetsHis,
          assocArrayOfSubmissionData[index].FleetsTotalSize,
          assocArrayOfSubmissionData[index].myFleetSize,
          assocArrayOfSubmissionData[index].numFleetsMine,
        ] 
      })
    }
  }

  findVersion(id: string): string {
    if (!this.submissions) {
      return '?';
    }
    for (const sub of this.submissions) {
      if (sub.id == id) {
        return `${sub.version}`;
      }
    }
    return '?';
  }
}
