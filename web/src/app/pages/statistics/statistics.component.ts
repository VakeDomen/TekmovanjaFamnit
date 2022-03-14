import { Component, OnInit } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { Game } from 'src/app/models/game.model';
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

  public chartsReady: boolean = false;

  public competitionsReady: boolean = false;;
  public selectedCompetition: Competition | undefined;
  
  private games: Game[] = [];
  public competitions: Competition[] = [];
  private contestants: Contestant[] = [];
  private submissions: Submission[] = [];
  private matches: Match[] = [];

  private contestantData: ContestantData[] | undefined;

  public globalScoreSeries: number[][] = [];

  constructor(
    private gameService: GamesService,
    private competitionService: CompetitionService, 
    private contestantService: ContestantService,
    private submissionService: SubmissionsService,
    private matchesService: MatchesService,
  ) { }

  ngOnInit(): void {
    this.gameService.getGames().subscribe((resp: ApiResponse<Game[]>) => {
      this.games = resp.data;
      this.competitionService.getCompetitions().subscribe((resp: ApiResponse<Competition[]>) => {
          this.competitions = resp.data;
          if (this.competitions.length) {
            this.selectedCompetition = resp.data[0];
          }
          this.competitionsReady = true;
        });
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
       const matches = submissionsWithMatches[i] ?? [];
        const sumb: SubmissionData[] = [];
        for (let j = 0 ; j < sumbissions.length ; j++) {
          sumb.push({
            submission: sumbissions[j],
            matches: matches[j]
          } as SubmissionData);
        }
        final.push({
          contestant: this.contestants[i],
          submissions: sumb
        } as ContestantData);
      }
      
      this.contestantData = final;
      this.processScores();

      console.log(final);
      this.chartsReady = true;
      
    });
  }

  private processScores() {
    if (!this.contestantData) {
      return;
    }
    const series: any[] = [];

    let seriesIndex = 0;
    for (const contestantSubmissions of this.contestantData) {
      const matchScores: number[] = [];
      for (const subData of contestantSubmissions.submissions) {
        for (const match of subData.matches) {
          if (!matchScores[+match.round]) {
            matchScores[+match.round] = 0;
          }
          if (match.submission_id_2 == match.submission_id_winner) {
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

}



interface ContestantData {
  contestant: Contestant;
  submissions: SubmissionData[];
}

interface SubmissionData {
  submission: Submission;
  matches: Match[]
}
