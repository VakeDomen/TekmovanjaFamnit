import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Competition } from 'src/app/models/competition.model';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { AuthService } from 'src/app/services/auth.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { GamesService } from 'src/app/services/games.service';
import { Contestant } from 'src/app/models/contestant.model';
import { ContestantService } from 'src/app/services/contestant.service';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.sass']
})
export class SubmissionsComponent implements OnInit {


  /*
     AUTO ROUTE TO RUNNING COMPETITION
   */
  private autoRoute: boolean = true;

  private games: Game[] = [];
  public contestants: Contestant[] = [];
  public competitions: Competition[] = [];

  public dataReady: boolean = false;

  constructor(
    private gameService: GamesService,
    private competitionService: CompetitionService,
    private toastr: ToastrService,
    private authService: AuthService,
    private contestantsService: ContestantService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.gameService.getGames().subscribe((resp: ApiResponse<Game[]>) => {
      this.games = resp.data;
      this.competitionService.getCompetitions().subscribe((resp: ApiResponse<Competition[]>) => {
        this.competitions = this.filterOnRunning(resp.data);
        this.contestantsService.getContestants().subscribe((resp: ApiResponse<Contestant[]>) => {
          this.contestants = resp.data;
          this.competitions = this.filterCompetitionsByContestants(this.competitions, this.contestants);
          if (this.autoRoute && this.contestants.length == 1) {
            this.router.navigate(['contestant', this.contestants[0].id]);
          }
          this.dataReady = true;
        }, err => {
          this.toastr.error("Oops, something went wrong!", "Failed fetching submissions");
          console.log(err)
        });
      }, err => {
        this.toastr.error("Oops, something went wrong!", "Failed fetching round types");
        console.log(err)
      });
    }, err => {
      this.toastr.error("Oops, something went wrong!", "Failed fething round types");
      console.log(err)
    });
  }

  filterCompetitionsByContestants(competitions: Competition[], contestants: Contestant[]): Competition[] {
    return competitions.filter((comp: Competition) => contestants.map((cont: Contestant) => cont.competition_id).includes(comp.id ?? ''));
  }

  getGameByContestant(contestant: Contestant): Game | undefined {
    for (const comp of this.competitions) {
      if (contestant.competition_id != comp.id) {
        continue;
      }
      for (const game of this.games) {
        if (game.id == comp.game_id) {
          return game;
        }
      }
    }
    return;
  }
  getCompetitionByContestant(contestant: Contestant): Competition | undefined {
    for (const comp of this.competitions) {
      if (contestant.competition_id == comp.id) {
        return comp;
      }
    }
    return;
  }
  routeToSubmission(cont: Contestant): void {
    this.router.navigate(['contestant', cont.id]);
  }

  filterOnRunning(competitions: Competition[]) {
    return competitions.filter((com: Competition) => this.isCompetitionRunning(com));
  }

  isCompetitionRunning(competition: Competition): boolean {
    return new Date().getTime() >= new Date(competition.start).getTime() &&
      new Date().getTime() <= new Date(competition.end).getTime();
  }

}
