import { Component, OnInit } from '@angular/core';
import { OutletContext, Router } from '@angular/router';
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
  public openAccordion: string | undefined;

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

  async init(): Promise<void> {
    // fetch games
    const gamesResp = await this.gameService.getGames().toPromise();
    if (!gamesResp) {
      this.toastr.error("Oops, something went wrong!", "Failed fetching games");
      return;
    }
    this.games = gamesResp.data;
    
    // fetch competitions (if admin, fetch all | if student, fetch ones i competed in)
    let req = this.authService.isAdmin() ? 
      this.competitionService.getCompetitions() :
      this.competitionService.getCompetingCompetitions();

    const competitionsResponse: ApiResponse<Competition[]> | undefined = await req.toPromise()
    if (!competitionsResponse) {
      this.toastr.error("Oops, something went wrong!", "Failed fetching competitions");
      return;
    }
    this.competitions = competitionsResponse.data;
    this.openAccordion = this.competitions[0].id;
    
    // fetch contestants (should be one per competition)
    let contestantResponse = await this.contestantsService.getContestants().toPromise();
    if (!contestantResponse) {
      this.toastr.error("Oops, something went wrong!", "Failed fetching contestants");
      return;
    }
    this.contestants = contestantResponse.data;

    // if competing in only one competition -> route to contestant
    if (this.competitions.length == 1 && this.contestants.length == 1) {
      if (this.autoRoute) {
        this.routeToSubmission(this.contestants[0]);
      }
    }
    
    this.dataReady = true;  
  }

  public contestantsInActiveCompetitions(contestants: Contestant[]): Contestant[] {
    const cont = [];
    for (const contestant of contestants) {
      if (this.getCompetitionByContestant(contestant)) {
        cont.push(contestant);
      }
    }
    return cont;
  }

  public contestantsInCompetition(comp: Competition): Contestant[] {
    const out = [];
    for (const cont of this.contestants) {
      if (cont.competition_id == comp.id) out.push(cont);
    }
    return out;
  }

  public getGameByContestant(contestant: Contestant): Game | undefined {
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
  public getCompetitionByContestant(contestant: Contestant): Competition | undefined {
    for (const comp of this.competitions) {
      if (contestant.competition_id == comp.id) {
        return comp;
      }
    }
    return;
  }
  public routeToSubmission(cont: Contestant): void {
    this.router.navigate(['contestant', cont.id]);
  }

  public isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  public accordionToggle(id: string | undefined) {
    if (this.openAccordion == id) {
      this.openAccordion = undefined;
    } else { 
      this.openAccordion = id;
    }
  }
}

