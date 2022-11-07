import { Component, OnInit } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { Game } from 'src/app/models/game.model';
import { Match } from 'src/app/models/match.model';
import { ApiResponse } from 'src/app/models/response';
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
  private competitionsReady: boolean = false;
  

  constructor(
    private gameService: GamesService,
    private competitionService: CompetitionService, 
    private contestantService: ContestantService,
    private submissionService: SubmissionsService,
    private matchesService: MatchesService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    let req = this.authService.isAdmin() ? this.competitionService.getCompetitions() : this.competitionService.getRunningCompetitions();
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
    this.fetchDataAndRankCompetition();
  }
  
  private fetchDataAndRankCompetition() {
    if (!this.selectedCompetition) {
      console.log("No competition selected...");
      return;
    }
    // this.matchesService.getRankingMatches()
    this.rankCompetition()
  }
  private rankCompetition() {
    
  }
}
