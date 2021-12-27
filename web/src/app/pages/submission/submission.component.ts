import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { FileModel } from 'src/app/models/file.model';
import { Game } from 'src/app/models/game.model';
import { Match } from 'src/app/models/match.model';
import { ApiResponse } from 'src/app/models/response';
import { Submission } from 'src/app/models/submission.model';
import { AuthService } from 'src/app/services/auth.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { ContestantService } from 'src/app/services/contestant.service';
import { FileService } from 'src/app/services/file.service';
import { GamesService } from 'src/app/services/games.service';
import { MatchesService } from 'src/app/services/matches.service';
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
  public openNewSubmissionModal: boolean = false;

  public newSubmission: Submission = {
    contestant_id: '',
    version: 0,
    file_id: '',
  };
  public newSubmissionFiles: File | undefined;

  constructor(
    private gameService: GamesService,
    private competitionService: CompetitionService,
    private contestantService: ContestantService,
    private submissionService: SubmissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    public authService: AuthService,
    private filesService: FileService,
    private matchesService: MatchesService,
  ) { }

  ngOnInit(): void {
    this.init();
  }

  private init(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.contestantService.getContestant(id).subscribe((resp: ApiResponse<Contestant[]>) => {
      if (!resp.data[0]) {
        this.handleError(null, "Failed fetching contestant");
        return;
      }
      if (resp.data[0].user_id != this.authService.getId() && !this.authService.isAdmin()) {
        this.router.navigate(["contestants"]);
      }
      this.contestant = resp.data[0];

      forkJoin({
        compeitionsResponse:  this.competitionService.getCompetition(this.contestant.competition_id),
        submissionsResponse:  this.submissionService.getSubmissionsByContestant(this.contestant.id ?? ''),
        matchesResponse:      this.matchesService.getMatches(this.contestant.id ?? ''),
      }).subscribe(({compeitionsResponse, submissionsResponse, matchesResponse}) => {
        
        if (!compeitionsResponse.data.length) {
          this.handleError(null, "Failed fetching competition!");
          return;
        }
        if (!submissionsResponse.data.length) {
          this.handleError(null, "Failed fetching submissions!");
          return;
        }
        if (!matchesResponse.data.length) {
          this.handleError(null, "Failed fetching matches!");
          return;
        }
        
        this.competition = compeitionsResponse.data[0];
        this.submissions = this.sortSubmissions(submissionsResponse.data);
        this.matches = matchesResponse.data;

        this.gameService.getGame(this.competition.game_id ?? '').subscribe((gameResp: ApiResponse<Game[]>) => {
          if (!gameResp.data.length) {
            this.handleError(null, "Failed fetching game");
            return;
          }
          this.game = gameResp.data[0];
          this.game.submission_description = unescape(this.game.submission_description);
          this.dataReady = true;

        }, err => this.handleError(err, "Failed fetching game"));
      }, err => this.handleError(err, "Failed fetching competition, submissions or matches"));
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
      if (match.submission_id_winner == match.submission_id_1) {
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

  prepareSubmission(file: File) {
    this.newSubmissionFiles = file;
  }

  saveSubmission(): void {
    if (!this.newSubmissionFiles) {
      this.toastr.error("No files to submit!", "Error!");
      return;
    }
    if (!this.contestant || !this.contestant.id) {
      this.toastr.error("Invalid contestant!", "Error!");
      return;
    }
    this.newSubmission.contestant_id = this.contestant?.id;
    this.newSubmission.version = this.getNextVersion();
  
    this.filesService.postSubmission(this.newSubmissionFiles, this.newSubmission.contestant_id, this.newSubmission.version).subscribe((resp: ApiResponse<FileModel>) => {
      if (!resp.data.id) {
        this.toastr.error("Error uploading file!", "Error!");
        return;
      }
      this.newSubmission.file_id = resp.data.id;
      this.submissionService.submitSubmission(this.newSubmission).subscribe((resp: ApiResponse<Submission>) => {
        this.submissions = [resp.data, ...this.submissions];
        this.newSubmission = {
          contestant_id: '',
          version: 0,
          file_id: '',
        };
        this.selectVersion(`${resp.data.version}`);
        this.openNewSubmissionModal = false;
      });
    }, (err: any) => {
      this.toastr.error("Oops, something went wrong!", "Error uploading submission!");
    });
  }

  getNextVersion(): number {
    return this.submissions.length;
  }

  accordionToggle(id: string | undefined) {
    if (this.openSubmissionAccordion == id) {
      this.openSubmissionAccordion = undefined;
    } else { 
      this.openSubmissionAccordion = id;
    }
  }

  downloadSubmission(id: string | undefined) {
    window.location.assign(this.filesService.getFileDownloadUrl(id ?? ''));
  }

  sortSubmissions(arr: Submission[]): Submission[] {
    return arr.sort((a: Submission, b: Submission) => a.version < b.version ? 1 : -1);
  }

  findSubmissionByVersion(version: string): Submission | null {
    for (const sub of this.submissions) {
      if (`${sub.version}` == version) {
        return sub;
      }
    }
    return null;
  }

  findSubmissionById(id: string): Submission | null {
    for (const sub of this.submissions) {
      if (`${sub.id}` == id) {
        return sub;
      }
    }
    return null;
  }

  selectVersion(version: string) {
    if (!this.contestant) {
      return;
    }
    const sub = this.findSubmissionByVersion(version);
    if (!sub) {
      return;
    }
    this.contestant.active_submission_id = sub.id;
    delete this.contestant.created;
    this.contestantService.updateContestant(this.contestant).subscribe((resp: ApiResponse<Contestant>) => {
      this.toastr.success("Updated active version!", "Success!");
    }, err => {
      console.log(err)
      this.toastr.error("Oops, somthing went wrong!", "Failed updating active version!");
    })
  }

  getActiveSubValue() {
    if (!this.contestant || !this.contestant.active_submission_id) {
      return 0;
    }
    return this.findSubmissionById(this.contestant.active_submission_id)?.version;
  }
}
