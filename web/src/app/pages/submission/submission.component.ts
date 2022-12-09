import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { FileModel } from 'src/app/models/file.model';
import { Game } from 'src/app/models/game.model';
import { IdentifiedMatch } from 'src/app/models/identified-match.model';
import { Match } from 'src/app/models/match.model';
import { Prog1scores } from 'src/app/models/prog1scores.model';
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

  public dataReady: boolean = false;
  public dataUnavalible: boolean = false;
  public loadingPercent: number = 0;

  public game: Game | undefined;
  public competition: Competition | undefined;
  public contestant: Contestant | undefined;
  public submissions: Submission[] = [];
  // public matches: Match[] = [];
  public matches: IdentifiedMatch[] = [];
  public prog1scores: Prog1scores[] = [];

  public openSubmissionAccordion: string | undefined;
  public openNewSubmissionModal: boolean = false;
  public openVideoModal: boolean = false;
  public activeSubmission: number | undefined;
  public matchToPlayVideo: IdentifiedMatch | undefined;
  
  public canUploadNewBot: boolean = true;

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

    this.contestantService.getContestant(id).subscribe(async (resp: ApiResponse<Contestant[]>) => {
      if (!resp.data[0]) {
        this.handleError(null, "Failed fetching contestant");
        return;
      }
      if (resp.data[0].user_id != this.authService.getId() && !this.authService.isAdmin()) {
        this.router.navigate(["contestants"]);
      }

      const prog1scoresResponse = await this.matchesService.getProg1Score(resp.data[0].id ?? '').toPromise();
      if (!prog1scoresResponse) {
        this.toastr.error("Something went wrong!", "Failed fetching prog 1 scores");
        return;
      }
      this.prog1scores = prog1scoresResponse.data;
      
      forkJoin({
        compeitionsResponse:  this.competitionService.getCompetition(resp.data[0].competition_id),
        submissionsResponse:  this.submissionService.getSubmissionsByContestant(resp.data[0].id ?? ''),
        matchesResponse:      this.matchesService.getMatches(resp.data[0].id ?? ''),
      }).subscribe(({compeitionsResponse, submissionsResponse, matchesResponse}) => {
        if (!compeitionsResponse.data.length) {
          this.handleError(null, "Failed fetching competition!");
          return;
        }
        this.gameService.getGame(compeitionsResponse.data[0].game_id ?? '').subscribe((gameResp: ApiResponse<Game[]>) => {
          if (!gameResp.data.length) {
            this.handleError(null, "Failed fetching game");
            return;
          }
          this.contestant = resp.data[0];
          this.competition = compeitionsResponse.data[0];
          this.submissions = this.nameSubmissions(this.sortSubmissions(submissionsResponse.data));
          this.matches = this.matchesService.identifyMathces(matchesResponse.data, this.submissions);
          this.game = gameResp.data[0];
          this.game.submission_description = unescape(this.game.submission_description);
          this.activeSubmission = this.getActiveSubValue();
          this.canUploadNewBot = this.calcCanUploadNewBot();
          this.dataReady = true;

        }, err => this.handleError(err, "Failed fetching game"));
      }, err => this.handleError(err, "Failed fetching competition, submissions or matches"));
    }, err => this.handleError(err, "Failed fetching contestant"));
  }


  
  calcCanUploadNewBot(): boolean {
    if (!this.competition) {
      return false;
    }
    return new Date().getTime() >= new Date(this.competition.start).getTime() &&
        new Date().getTime() <= new Date(this.competition.end).getTime();
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
      if (this.matchesService.isMatchWon(match)) {
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
    const diff = date1.getTime() - date2.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24)); 
    return diffDays;
  }

  prepareSubmission(file: File) {
    if (!file.name.includes(".zip")) {
      this.toastr.warning("Please submit a zip file", "Hmm...not a .zip file?");
      return
    }
    this.newSubmissionFiles = file;
  }

  nameSubmissions(subs: Submission[]) {
    return subs.map((s: Submission) => {
      if(s.name) {
        s.name = s.name.split("/");
        s.name = s.name[s.name.length -1];
        s.name = s.name.split(".");
        s.name = s.name[0];
      }
      return s;
    })
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
      this.submissionService.submitSubmission(this.newSubmission).subscribe((resp: ApiResponse<Submission[]>) => {
        const sub = resp.data.pop();
        this.submissions = this.nameSubmissions([sub as Submission, ...this.submissions]);
        (this.contestant as Contestant).active_submission_id = (sub as Submission).id;
        this.activeSubmission = this.getActiveSubValue();
        this.newSubmission = {
          contestant_id: '',
          version: 0,
          file_id: '',
        };
        this.selectVersion(`${(sub as Submission).version}`);
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
      this.activeSubmission = this.getActiveSubValue();
    }, err => {
      console.log(err)
      this.toastr.error("Oops, somthing went wrong!", "Failed updating active version!");
    })
  }

  getActiveSubValue() {
    if (!this.contestant || !this.contestant.active_submission_id) {
      return 0;
    }
    const sub = this.findSubmissionById(this.contestant.active_submission_id);
    if (!sub) {
      return 0;
    }
    return sub.version ?? 0;
  }

  loading(event: number) {
    if (this.matches.length) {
      this.loadingPercent = Math.round((event / this.matches.length) * 100);
    }
  }

  areChartsLoaded() {
    return this.loadingPercent > 99 || this.matches.length == 0;
  }

  getProg1ScoreBySubmission(submission: Submission): Prog1scores | null {
    for (const scr of this.prog1scores) {
      if (scr.submission_id == submission.id) return scr;
    } 
    return null;
  }

  getProg1ScoreWinrateBySubmission(submission: Submission, difficulty: string): string {
    const wins = `${difficulty}_wins`;
    const losses = `${difficulty}_losses`;
    const sub: any = this.getProg1ScoreBySubmission(submission);
    if (!sub) return "0";
    const sub_wins = sub[wins] as number;
    const sub_losses = sub[losses] as number;
    if (sub_losses == 0 && sub_wins == 0) return "0";
    return ( (sub_wins / (sub_losses + sub_wins)) * 100 ).toFixed(2)
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  iAmPlayer(match: IdentifiedMatch): number {
    if (match.submission_id_1 == match.submission_id_2) return 2
    else return match.me;
  }

  myPlayerString(match: IdentifiedMatch): string {
    switch (this.iAmPlayer(match)) {
      case 0: return 'Player 1';
      case 1: return 'Player 2';
      case 2: return 'Both';
      default: return 'Player 1';
    }
  }

  isMatchWon(match: IdentifiedMatch): boolean {
    return this.matchesService.isMatchWon(match);
  }

  isMatchWonString(match: IdentifiedMatch): string {
    return this.matchesService.isMatchWon(match) ? 'Win' : "Loss";
  }

  matchHasRecording(match: IdentifiedMatch): boolean {
    return match.log_file_id.includes("resources/");
  }

  noRecordingPlaceholder(match: IdentifiedMatch): string {
    const additionalData = JSON.parse(match.additional_data);
    if (additionalData && additionalData.error) {
      return additionalData.error;
    } else {
      return match.log_file_id;
    }
  }

  matchesBySubmission(submission: Submission): IdentifiedMatch[] {
    const matches = [];
    for (const match of this.matches) {
      if (match.submission_id_1 == submission.id) {
        matches.push(match);
      } else if (match.submission_id_2 == submission.id) {
        matches.push(match);
      }
    }
    return matches.reverse();
  }

}
