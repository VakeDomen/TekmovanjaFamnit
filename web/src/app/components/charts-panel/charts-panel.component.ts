import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IdentifiedMatch } from 'src/app/models/identified-match.model';
import { Match } from 'src/app/models/match.model';
import { Submission } from 'src/app/models/submission.model';
import { MatchesService } from 'src/app/services/matches.service';

@Component({
  selector: 'app-charts-panel',
  templateUrl: './charts-panel.component.html',
  styleUrls: ['./charts-panel.component.sass']
})
export class ChartsPanelComponent implements OnChanges {

  private MAX_RADIALS: number = 4;
  private MAX_SCORE_ROUNDS = 40;

  @Input() submissions: Submission[] = [];
  @Input() matches: IdentifiedMatch[] = [];

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
  public subSwitchPoints: any[] = [];
  /*
    win rate chart
  */

  public wrlabels: string[] = [];
  public wrseries: any[] = [];

  public wlrlabels: string[] = [];
  public wlrseries: any[] = [];

  constructor(
    private matchService: MatchesService,
  ) { }

  
  ngOnChanges(changes: SimpleChanges): void {
    const t0 = new Date().getMilliseconds();
    /*
      data checks
    */
    if (!this.submissions || !this.submissions.length || !this.matches || !this.matches.length) {
      return;
    }
    this.matches.sort((m1: IdentifiedMatch, m2: IdentifiedMatch) => +m1.round < +m2.round ? -1 : 1);
  
    /*
      radar chart init
    */
    const assocArrayOfSubmissionData: any = {};
    const roundData: any = {};
    const winRateData: any = {};
    const annot: any[] = [];
    let count = 0;
    let lastSub: string | undefined;
    for (const match of this.matches) {
      const submissionIndex = match.me == 0 ? match.submission_id_1 : match.submission_id_2;
    /*
        radar chart
      */
      let aditionalData;
      try { aditionalData = JSON.parse(match.additional_data); }
      catch { return; }
      this.pushToElement(assocArrayOfSubmissionData, submissionIndex, aditionalData);

      /*
        score chart
      */
      if (lastSub) {
        if (lastSub != submissionIndex) {
          annot.push(this.newPointAnnotations(match));
          lastSub = submissionIndex;
        }
      } else {
        lastSub = submissionIndex;
      }
      this.initRoundDataScoreChart(roundData, match.round);
      this.addToRoundScore(roundData, match);
      /*
        win rate chart
      */
      this.addToWinRateData(winRateData, match);
      count++;
      this.processingDone.emit(count);
    };
    /*
      win rate chart
    */
    let series = Object.keys(winRateData).map(
      (elIndex: string) => {
        return { 
          data: Math.round((winRateData[elIndex][0] / winRateData[elIndex][1]) * 100), 
          label: elIndex
        };
      }
    );
    const w1l: string[] = [];
    const w1s: any[] = [];
    series.sort((el: any, el1: any) => el.data > el1.data ? -1 : 1).slice(0, this.MAX_RADIALS).forEach((el: any) => {
      w1l.push(this.findVersion(el.label));
      w1s.push(el.data);
    });
    this.wrlabels = w1l;
    this.wrseries = w1s;

    const w2l: string[] = [];
    const w2s: any[] = [];
    series.sort((el: any, el1: any) => this.findVersion(el.label) > this.findVersion(el1.label) ? -1 : 1).slice(-this.MAX_RADIALS).forEach((el: any) => {
      w2l.push(this.findVersion(el.label));
      w2s.push(el.data);
    });
    this.wlrlabels = w2l;
    this.wlrseries = w2s;

    
    /*
      score chart
    */
    let prev = 0;
    const labs1: string[] = [];
    const s1: any[] = [];
    const s2: any[] = []; 
    for (const rdi in roundData) {
      prev = prev + roundData[rdi].roundScore;
      labs1.push(rdi);
      s1.push(roundData[rdi].roundScore);
      s2.push(prev);
    }
    this.labels = labs1;
    this.series1 = s1;
    this.series2 = s2;
    this.subSwitchPoints = annot;
    /*
      radar chart
    */
    const rcs: any[] = [];
    for (const index in assocArrayOfSubmissionData) {
      this.averageRadar(assocArrayOfSubmissionData[index]);
      rcs.push(this.constructRadarChartSeriesElement(assocArrayOfSubmissionData, index));
    }
    this.radarChartSeries = rcs;
    this.dataReady = true;
    const t1 = new Date().getMilliseconds();
  }

  newPointAnnotations(match: IdentifiedMatch) {
    const submissionIndex = match.me == 0 ? match.submission_id_1 : match.submission_id_2;
    return {
      x: match.round,
      marker: {
        fillColor: "#50C878",
        size: 5,
        radius: 3,
      },
      label: {
        borderColor: '#FF4560',
        offsetY: 0,
        style: {
          color: '#fff',
          background: '#FF4560',
        },
        text: this.findVersion(submissionIndex),
      }
    };
  }

  addToWinRateData(data: any[], match: IdentifiedMatch) {
    const submissionIndex = match.me == 0 ? match.submission_id_1 : match.submission_id_2;
    if (!data[submissionIndex as any]) {
      this.initWinrateData(data, match);
    }
    if (this.matchService.isMatchWon(match)) {
      data[submissionIndex as any][0]++;
    }
    data[submissionIndex as any][1]++;
  }

  initWinrateData(data: any[], match: IdentifiedMatch) {
    if (match.me == 0) data[match.submission_id_1 as any] = [0, 0];
    else data[match.submission_id_2 as any] = [0, 0];
  }
  
  addToRoundScore(roundData: any[], match: IdentifiedMatch) {
    if (this.matchService.isMatchWon(match)) {
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
        return `${sub.name}`;
      }
    }
    return '?';
  }

  averageRadar(el: any) {

    const maxmyFleetSize = Math.max(...el.myFleetSize as number[]);
    const maxhisFleetSize = Math.max(...el.hisFleetSize as number[]);
    const maxnumFleetsMine = Math.max(...el.numFleetsMine as number[]);
    const maxFleetsTotalSize = Math.max(...el.FleetsTotalSize as number[]);
    const maxnumFleetsHis = Math.max(...el.numFleetsHis as number[]);
    const maxnumFleetsTotal = Math.max(...el.numFleetsTotal as number[]);
    el.myFleetSize = ((el.myFleetSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.myFleetSize.length) / maxmyFleetSize) * 100;
    el.hisFleetSize = ((el.hisFleetSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.hisFleetSize.length) / maxhisFleetSize) * 100;
    el.numFleetsMine = ((el.numFleetsMine.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.numFleetsMine.length) / maxnumFleetsMine) * 100;
    el.FleetsTotalSize = ((el.FleetsTotalSize.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.FleetsTotalSize.length) / maxFleetsTotalSize) * 100;
    el.numFleetsHis = ((el.numFleetsHis.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.numFleetsHis.length) / maxnumFleetsHis) * 100;
    el.numFleetsTotal = ((el.numFleetsTotal.reduce((partial_sum: number, el: number) => partial_sum + el, 0) / el.numFleetsTotal.length) / maxnumFleetsTotal) * 100;
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
