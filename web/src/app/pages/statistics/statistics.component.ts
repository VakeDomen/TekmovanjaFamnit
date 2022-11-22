import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { Game } from 'src/app/models/game.model';
import { IdentifiedMatch } from 'src/app/models/identified-match.model';
import { Match } from 'src/app/models/match.model';
import { ApiResponse } from 'src/app/models/response';
import { Submission } from 'src/app/models/submission.model';
import { CompetitionService } from 'src/app/services/competition.service';
import { ContestantService } from 'src/app/services/contestant.service';
import { GamesService } from 'src/app/services/games.service';
import { MatchesService } from 'src/app/services/matches.service';
import { SubmissionsService } from 'src/app/services/submissions.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.sass']
})
export class StatisticsComponent implements OnInit {

  public NUMBET_OF_LATEST_SUBMISSIONS_DISPLAYED = 7;

  public chartsReady: boolean = false;

  public competitionsReady: boolean = false;;
  public selectedCompetition: Competition | undefined;
  public competitions: Competition[] = [];
  public globalScoreSeries: number[][] = [];
  public submissionCountSeries: any;
  public statSubmissionTable: any[] = [];
  
  private contestants: Contestant[] = [];
  private contestantData: ContestantData[] | undefined;

  constructor(
    private competitionService: CompetitionService, 
    private contestantService: ContestantService,
    private submissionService: SubmissionsService,
    private matchesService: MatchesService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.competitionService.getCompetitions().subscribe((resp: ApiResponse<Competition[]>) => {
      this.competitions = resp.data;
      if (this.competitions.length) {
        this.selectedCompetition = resp.data[0];
      }
      this.competitionsReady = true;
    });
  }

  selectCompetition(competition_name: string) {
    for (const competition of this.competitions) {
      if (competition.competition_name == competition_name) {
        if (this.selectedCompetition?.competition_name != competition_name) {
          this.selectedCompetition = competition;
        }
      }
    }
  }

  startCharting() {
    this.contestantService.getContestantsByCompetition(this.selectedCompetition?.id ?? "").subscribe(async (resp: ApiResponse<Contestant[]>) => {
      this.contestants = resp.data;
      const contestantSubmissionPromises: Promise<ApiResponse<Submission[]> | undefined>[] = this.contestants.map((cont: Contestant) => {
        return this.submissionService.getSubmissionsByContestant(cont.id ?? "").toPromise();
      });
      const contestantSubmissions: (Submission[] | undefined)[] = (await Promise.all(contestantSubmissionPromises)).map((sub: ApiResponse<Submission[]> | undefined) => {
        if (typeof sub == 'undefined') {
          return sub;
        }
        return sub.data;
      });

      const submissionsWithMatchesPromisses = contestantSubmissions.map((sub: Submission[] | undefined) => {
        if (typeof sub == 'undefined') {
          return sub;
        }
        return sub.map((subm: Submission) => this.matchesService.getMatchesBySubmission(subm.id ?? "").toPromise());
      });

      const submissionsWithMatches = await Promise.all(submissionsWithMatchesPromisses.map(async (sub: Promise<ApiResponse<Match[]> | undefined>[] | undefined) => {
        if (typeof sub == 'undefined') {
          return sub;
        }
        return (await Promise.all(sub)).map((subm: ApiResponse<Match[]> | undefined) => {
          if (typeof subm == 'undefined') {
            return subm;
          }
          return subm?.data;
        });
      }));

      const final: ContestantData[] = [];
      for (let i = 0 ; i < this.contestants.length ; i++) {
        const sumbissions = contestantSubmissions[i] ?? [];
        const matches = (submissionsWithMatches[i] ?? []);
        const sumb: SubmissionData[] = [];
        for (let j = 0 ; j < sumbissions.length ; j++) {
          const submissionMatches = matches[j] ?? [];
          sumb.push({
            submission: sumbissions[j],
            identifiedMatches: this.matchesService.identifyMathces(submissionMatches, sumbissions)
          } as SubmissionData);
        }
        final.push({
          contestant: this.contestants[i],
          submissions: sumb
        } as ContestantData);
      }
      
      this.contestantData = final;
      
      this.processScores();
      this.processSubmissionCount();
      this.processSubmissionTable();

      this.chartsReady = true;
      
    });
  }

  private processSubmissionTable() {
    if (!this.contestantData) {
      return;
    }
    const aggr: any = {};
    const submissions: any[] = [];
    for (const contestant of this.contestantData) {
      contestant.submissions.forEach(sd => sd.submission.submission_date = new Date(sd.submission.created ?? ''))
      submissions.push(...contestant.submissions.map(sd => { return { 
        contestant: contestant.contestant,
        submission: sd.submission, 
        matches: sd.identifiedMatches
      }}));
    }
    submissions.sort((a: any, b: any) => -(a.submission.submission_date?.getTime() ?? 1) + (b.submission.submission_date?.getTime() ?? 1));
    this.statSubmissionTable = submissions.splice(0, this.NUMBET_OF_LATEST_SUBMISSIONS_DISPLAYED);
  }

  private processSubmissionCount() {
    if (!this.contestantData) {
      return;
    }
    const aggr: any = {};
    const submissions: Submission[] = [];
    for (const contestant of this.contestantData) {
      contestant.submissions.forEach(sd => sd.submission.submission_date = new Date(sd.submission.created ?? ''))
      submissions.push(...contestant.submissions.map(sd => sd.submission));
    }
    submissions.sort((a: Submission, b: Submission) => (a.submission_date?.getTime() ?? 1) - (b.submission_date?.getTime() ?? 1));
    
    for (const sub of submissions) {
      let date: string = (+(sub.submission_date?.getDate() ?? 0)) + ". " + (+(sub.submission_date?.getMonth() ?? 0) + 1) + ". " + sub.submission_date?.getFullYear();
      if (!aggr[date]) {
        aggr[date] = 1;
      } else {
        aggr[date]++;
      }
    }

    const final = [];
    for (const aggIndex in aggr) {
      final.push({x: aggIndex, y: aggr[aggIndex]});
    }

    this.submissionCountSeries = final;
  }

  private processScores() {
    if (!this.contestantData) {
      return;
    }
    const series: any[] = [];
    console.log(this.contestantData);
    
    let seriesIndex = 0;
    for (const contestantSubmissions of this.contestantData) {
      const matchScores: number[] = [];
      for (const subData of contestantSubmissions.submissions) {
        for (const match of subData.identifiedMatches) {
          if (!matchScores[+match.round]) {
            matchScores[+match.round] = 0;
          }
          if (!this.matchesService.isMatchWon(match)) {
            matchScores[+match.round]--;
          } else {
            matchScores[+match.round]++;
          }
        }
      }
      series.push({
        name: this.contestants[seriesIndex].name ? (this.contestants[seriesIndex].name as any[])[0].name : this.contestants[seriesIndex].user_id,
        data: matchScores
      });
      seriesIndex++;
    }
    
    this.globalScoreSeries = series.map((data: any) => {
      let start: boolean = false;
      for (let i  = 0 ; i < data.data.length ; i++) {
        if (!data.data[i]) {
          data.data[i] = null;
        }
        if (data.data && !start) {
          start = true;
        }

        if (start == true && i > 0 && data.data[i-1]) {
          data.data[i] += data.data[i-1];
        }
      }
      return data;
    });
  }

  convertDate(date: string) {
    return new Date(date);
  } 

  navigate(contestant: Contestant) {
    this.router.navigate(["contestant", contestant.id]);
  }

  calcSubWins(mat: IdentifiedMatch[]): number {
    if (!mat.length) {
      return 0;
    }
    let wins = 0;
    for (const m of mat) {
      if (this.matchesService.isMatchWon(m)) {
        wins++;
      }
    }
    return wins;
  }

  calcSubWinLossRatio(mat: IdentifiedMatch[]): string {
    if (!mat.length) {
      return '0';
    }
    let wins = 0;
    for (const m of mat) {
      if (this.matchesService.isMatchWon(m)) {
        wins++;
      }
    }
    return (wins / mat.length).toFixed(2);
  }


}



interface ContestantData {
  contestant: Contestant;
  submissions: SubmissionData[];
}

interface SubmissionData {
  submission: Submission;
  identifiedMatches: IdentifiedMatch[]
}
