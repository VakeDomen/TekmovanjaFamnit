import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Match } from 'src/app/models/match.model';
import { Submission } from 'src/app/models/submission.model';

@Component({
  selector: 'app-charts-panel',
  templateUrl: './charts-panel.component.html',
  styleUrls: ['./charts-panel.component.sass']
})
export class ChartsPanelComponent implements OnChanges {

  private MAX_RADIALS: number = 4;

  @Input() submissions: Submission[] = [];
  @Input() matches: Match[] = [];

  @Output() processingDone = new EventEmitter<number>();
  dataReady = false;
  /*
    radar
  */
  public radarChartSeries: any[] = [];
  /*
    score chart
  */
  public series1: any[] = [];
  public series2: any[] = [];
  public labels: string[] = [];

  /*
    win rate chart
  */

  public wrlabels: string[] = [];
  public wrseries: any[] = [];

  constructor() { }

  
  ngOnChanges(changes: SimpleChanges): void {
    const t0 = new Date().getMilliseconds();
    /*
      data checks
    */
    if (!this.submissions || !this.submissions.length || !this.matches || !this.matches.length) {
      return;
    }
    this.matches.sort((m1: Match, m2: Match) => m1.round < m2.round ? -1 : 1);
  
    /*
      radar chart init
    */
    const assocArrayOfSubmissionData: any = {};
    const roundData: any = {};
    const winRateData: any = {};
    let count = 0;
    this.matches.forEach((match: Match) => {
      /*
        radar chart
      */
      let aditionalData;
      try { aditionalData = JSON.parse(match.additional_data); }
      catch { return; }
      this.pushToElement(assocArrayOfSubmissionData, match.submission_id_1, aditionalData);

      /*
        score chart
      */
      this.initRoundDataScoreChart(roundData, match.round);
      this.addToRoundScore(roundData, match);
      /*
        win rate chart
      */
      this.addToWinRateData(winRateData, match);
      count++;
      this.processingDone.emit(count);
    });
    /*
      win rate chart
    */
    let series = Object.keys(winRateData).map(
      (elIndex: string) => {return { data: winRateData[elIndex][0] / winRateData[elIndex][1], label: elIndex};}
    );
    series.sort((el: any, el1: any) => el.data < el1.data ? -1 : 1).slice(0, this.MAX_RADIALS).forEach((el: any) => {
      this.wrlabels.push("Version " + this.findVersion(el.label));
      this.wrseries.push(el.data);
    }) ;
    
    /*
      score chart
    */
    let prev = 0;
    for (const rdi in roundData) {
      prev = prev + roundData[rdi].roundScore;
      this.labels.push(rdi);
      this.series1.push(roundData[rdi].roundScore);
      this.series2.push(prev);
    }
    /*
      radar chart
    */
    for (const index in assocArrayOfSubmissionData) {
      this.averageRadar(assocArrayOfSubmissionData[index]);
      this.radarChartSeries.push(this.constructRadarChartSeriesElement(assocArrayOfSubmissionData, index));
    }
    this.dataReady = true;
    const t1 = new Date().getMilliseconds();
    console.log("t: ", t1 - t0);
  }

  addToWinRateData(data: any[], match: Match) {
    if (!data[match.submission_id_1 as any]) {
      this.initWinrateData(data, match);
    }
    if (this.isWin(match)) {
      data[match.submission_id_1 as any][0]++;
    }
    data[match.submission_id_1 as any][1]++;
  }

  isWin(match: Match) {
    return match.submission_id_2 != match.submission_id_winner;
  }

  initWinrateData(data: any[], match: Match) {
    data[match.submission_id_1 as any] = [0, 0];
  }
  
  addToRoundScore(roundData: any[], match: Match) {
    if (this.isWin(match)) {
      roundData[match.round as any].roundScore++;
    } else {
      roundData[match.round as any].roundScore--;
    }
  }

  initRoundDataScoreChart(arr: any[], index: any) {
    if (!arr[index]) {
      arr[index] = {};
      arr[index].score = 0;
      arr[index].roundScore = 0;
    }
  }
  constructRadarChartSeriesElement(els: any[], index: any) {
    return {
      name: `V${this.findVersion(index)}`,
      data: [
        els[index].numFleetsTotal,
        els[index].hisFleetSize,
        els[index].numFleetsHis,
        els[index].FleetsTotalSize,
        els[index].myFleetSize,
        els[index].numFleetsMine,
      ] 
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

  averageRadar(el: any) {
    el.myFleetSize = el.myFleetSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.myFleetSize.length;
    el.hisFleetSize = el.hisFleetSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.hisFleetSize.length;
    el.numFleetsMine = el.numFleetsMine.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.numFleetsMine.length;
    el.FleetsTotalSize = el.FleetsTotalSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.FleetsTotalSize.length;
    el.numFleetsHis = el.numFleetsHis.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.numFleetsHis.length;
    el.numFleetsTotal = el.numFleetsTotal.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.numFleetsTotal.length;
  }

  initAssocArray(els: any[], index: any) {
    els[index] = {};
    els[index].myFleetSize = [];
    els[index].hisFleetSize = [];
    els[index].numFleetsMine = [];
    els[index].FleetsTotalSize = [];
    els[index].numFleetsHis = [];
    els[index].numFleetsTotal = [];
  }

  pushToElement(arr: any[], index: any, aditionalData: any) {
    if (!arr[index]) {
      this.initAssocArray(arr, index);
    }
    arr[index].myFleetSize.push(aditionalData.myFleetSize);
    arr[index].hisFleetSize.push(aditionalData.hisFleetSize);
    arr[index].numFleetsMine.push(aditionalData.numFleetsMine);
    arr[index].FleetsTotalSize.push(aditionalData.FleetsTotalSize);
    arr[index].numFleetsHis.push(aditionalData.numFleetsHis);
    arr[index].numFleetsTotal.push(aditionalData.numFleetsTotal);
  }
}
