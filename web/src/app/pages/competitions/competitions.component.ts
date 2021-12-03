import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Competition } from 'src/app/models/competition.model';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { AuthService } from 'src/app/services/auth.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.sass']
})
export class CompetitionsComponent implements OnInit {

  /*
    AUTO ROUTE TO RUNNING COMPETITION
  */
  private autoRoute: boolean = true;

  private games: Game[] = [];
  public competitions: Competition[] = [];

  public dataReady: boolean = false;

  constructor(
    private gameService: GamesService,
    private competitionService: CompetitionService, 
    private toastr: ToastrService,
    private authService: AuthService,
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
        if (this.autoRoute && this.competitions.length == 1) {
          this.router.navigate(['competition', this.competitions[0].id ]);
        }
        this.dataReady = true;
      }, err => {
        this.toastr.error("Oops, something went wrong!", "Failed fetching round types");
        console.log(err)  
      });
    }, err => {
      this.toastr.error("Oops, something went wrong!", "Failed fething round types");
      console.log(err)  
    });
  }

  getGameByCompetition(competition: Competition): Game | undefined {
    for (const game of this.games) {
      if (game.id == competition.game_id) {
        return game;
      }
    }
    return;
  }

  routeToCompetition(competition: Competition): void {
    this.router.navigate(['competition', competition.id]);
  }

  filterOnRunning(competitions: Competition[]) {
    return competitions.filter((com: Competition) => this.isCompetitionRunning(com));
  }

  isCompetitionRunning(competition: Competition): boolean {
    return new Date().getTime() >= new Date(competition.start).getTime() && 
      new Date().getTime() <= new Date(competition.end).getTime();
  }

}
