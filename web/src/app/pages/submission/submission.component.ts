import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { Game } from 'src/app/models/game.model';
import { Match } from 'src/app/models/match.model';
import { ApiResponse } from 'src/app/models/response';
import { Submission } from 'src/app/models/submission.model';
import { AuthService } from 'src/app/services/auth.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { ContestantService } from 'src/app/services/contestant.service';
import { GamesService } from 'src/app/services/games.service';
import { SubmissionsService } from 'src/app/services/submissions.service';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.sass']
})
export class SubmissionComponent implements OnInit {

  public dataReady: boolean = true;
  public dataUnavalible: boolean = false;

  public game: Game | undefined;
  public competition: Competition | undefined;
  public contestant: Contestant | undefined;
  public submissions: Submission[] = [];
  public matches: Match[] = [];

  public openSubmissionAccordion: string | undefined;

  constructor(
    private gameService: GamesService,
    private competitionService: CompetitionService,
    private contestantService: ContestantService,
    private submissionService: SubmissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.init();
  }

  private init(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    if (id != this.authService.getId() && !this.authService.isAdmin()) {
      this.router.navigate(["contestant", this.authService.getId()]);
    }
    this.contestantService.getContestant(id).subscribe((resp: ApiResponse<Contestant[]>) => {
      if (!resp.data[0]) {
        this.handleError(null, "Failed fetching contestant");
        return;
      }
      this.contestant = resp.data[0];

      forkJoin({
        compeitionsResponse: this.competitionService.getCompetition(this.contestant.competition_id),
        submissionsResponse: this.submissionService.getSubmissionsByContestant(this.contestant.id ?? ''),
      }).subscribe(({compeitionsResponse, submissionsResponse}) => {
        
        if (!compeitionsResponse.data.length) {
          this.handleError(null, "Failed fetching competition");
          return;
        }
        
        this.competition = compeitionsResponse.data[0];
        this.submissions = submissionsResponse.data;

        this.gameService.getGame(this.competition.game_id ?? '').subscribe((gameResp: ApiResponse<Game[]>) => {
          if (!gameResp.data.length) {
            this.handleError(null, "Failed fetching game");
            return;
          }
          this.game = gameResp.data[0];
          this.dataReady = true;

        }, err => this.handleError(err, "Failed fetching game"));
      }, err => this.handleError(err, "Failed fetching competition and submissions"));
    }, err => this.handleError(err, "Failed fetching contestant"));
  }

  handleError(err: any, label: string): void {
    console.log(err);
    this.toastr.error("Oops, something went wrong", label);
    this.dataUnavalible = true;
  }

  calcScore(): number {
    if (!this.matches.length) {
      return 0;
    }
    let score = 0;
    for (const match of this.matches) {
      if (match.submission_id_winner == this.authService.getId()) {
        score++;
      } else {
        score--;
      }
    }
    return score;
  }

  calcDaysLeft(): number {
    if (!this.competition?.end) {
      return 0;
    }
    const date1 = new Date(this.competition?.end);
    const date2 = new Date();
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24)); 
    return diffDays;
  }
}
