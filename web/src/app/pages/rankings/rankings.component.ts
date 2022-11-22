import { Component, OnInit } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { Game } from 'src/app/models/game.model';
import { IdentifiedMatch } from 'src/app/models/identified-match.model';
import { Match } from 'src/app/models/match.model';
import { ApiResponse } from 'src/app/models/response';
import { Submission } from 'src/app/models/submission.model';
import { AuthService } from 'src/app/services/auth.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { ContestantService } from 'src/app/services/contestant.service';
import { GamesService } from 'src/app/services/games.service';
import { MatchesService } from 'src/app/services/matches.service';
import { SubmissionsService } from 'src/app/services/submissions.service';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.sass']
})
export class RankingsComponent implements OnInit {

  public competitions: Competition[] = [];
  public matches: Match[] = [];
  private selectedCompetition: Competition | undefined;
  public competitionsReady: boolean = false;
  public ranking: [number, string][] = []; // [score, submission_id][]
  public rankingReady: boolean = true;
  private mySubmissions: Submission[] | undefined;
  private myContestants: Contestant[] = [];
  

  constructor(
    private competitionService: CompetitionService, 
    private submissionService: SubmissionsService,
    private contestantService: ContestantService,
    private matchesService: MatchesService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    let req = this.authService.isAdmin() ? 
      this.competitionService.getCompetitions() : 
      this.competitionService.getCompetingCompetitions();
    req.subscribe((resp: ApiResponse<Competition[]>) => {
      this.competitions = resp.data;
      if (this.competitions.length) {
        this.selectedCompetition = resp.data[0];
      }
      this.competitionsReady = true;
    });
  }

  public selectCompetition(competitionName: string) {
    for (const competition of this.competitions) {
      if (competition.competition_name == competitionName) {
        if (this.selectedCompetition?.competition_name != competitionName) {
          this.selectedCompetition = competition;
        }
      }
    }
  }

  public async fetchDataAndRankCompetition() {
    this.rankingReady = false;
    if (!this.selectedCompetition) {
      console.log("No competition selected...");
      return;
    }
    // fetch contestants of this specific competition
    let contestants = await this.contestantService.getContestantsByCompetition(this.selectedCompetition.id as string).toPromise();
    if (!contestants || !contestants.data.length) {
      console.log("No contestants found...");
      return;
    }
    this.myContestants = contestants.data;
    // we assume player only has up to one contestant per competition
    const contestant = this.findCompetitionContestant(this.selectedCompetition.id as string);
    if (!contestant) {
      console.log("No contestant found...");
      return;
    }
    this.matchesService.getRankingMatches(this.selectedCompetition.id as string).subscribe((matchResp: ApiResponse<Match[]>) => {
      let req;
      if (this.authService.isAdmin()) {
        req = this.submissionService.getSubmissionsByCompetition(this.selectedCompetition?.id as string);
      } else {
        req = this.submissionService.getSubmissionsByContestant(contestant.id as string);
      }
      req.subscribe((resp: ApiResponse<Submission[]>) => {
        this.mySubmissions = resp.data;
        this.rankMatches(matchResp.data)
      });    
    })
  }
  
  private findCompetitionContestant(compId: string): Contestant | null {
    for (const cont of this.myContestants) {
      if (cont.competition_id == compId) return cont;
    }
    return null;
  }
  
  private rankMatches(matches: Match[]) {
    const matchRankings: Map<string, number> = new Map();
    for (const match of matches) {
      let points = this.matchesService.isMatchWonUnidentified(match, 0) ? 1 : -1;
      matchRankings.set(
        match.submission_id_1, 
        (matchRankings.get(match.submission_id_2) ?? 0) + points
      );
      matchRankings.set(
        match.submission_id_2, 
        (matchRankings.get(match.submission_id_2) ?? 0) + -points
      );
    }
    const rankingArray: [number, string][] = [];
    matchRankings.forEach((score: number, id: string) => {
      rankingArray.push([score, id]);
    });
    this.ranking = rankingArray.sort((a: [number, string], b: [number, string]) => b[0] - a[0]);
    this.rankingReady = true;
  }

  public getSubmissionName(submissionId: string): string {
    if (!this.mySubmissions) return "???";
    for (const sub of this.mySubmissions) {
      if (sub.id == submissionId) return this.nameSubmissions(sub.name) ?? "???";
    }
    return  "???";
  }

  public getSubmissionScore(ranking: [number, string]): string {
    if (!this.mySubmissions) return "???";
    for (const sub of this.mySubmissions) {
      if (sub.id == ranking[1]) return ranking[0].toString() ?? "???";
    }
    return  "???";
  }

  private nameSubmissions(subPath: string): string {
    let name_fr = subPath.split("/");
    let name_fl = name_fr[name_fr.length -1];
    let name = name_fl.split(".");
    return name[0];
  }

}
