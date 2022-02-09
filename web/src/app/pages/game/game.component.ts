import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { GamesService } from 'src/app/services/games.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from 'src/app/services/file.service';
import { Competition } from 'src/app/models/competition.model';
import { RoundTypesService } from 'src/app/services/round-types.service';
import { RoundType } from 'src/app/models/round-type.model';
import { CompetitionService } from 'src/app/services/competition.service';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {

  public game: Game | undefined;
  public roundTypes: RoundType[] | undefined;
  public competitions: Competition[] = [];

  public dataUndefined: boolean = false;
  public dataReady: boolean = false;
  public previewModalOpen: boolean = false;
  public sPreviewModalOpen: boolean = false;
  public competitionModalOpen: boolean = false;

  public decriptionEdit: SafeHtml | undefined;
  public sDecriptionEdit: SafeHtml | undefined;
  public newCompetition: Competition = {
    game_id: '',
    competition_name: '',
    start: '',
    end: '',
    banner_page: '',
    allowed_submissions: 0,
    active_round_type_id: ''
  }

  public tab: 'competitions' | 'description' | 's_description' = 'description';

  constructor(
    private route: ActivatedRoute,
    private gameService: GamesService,
    private toastr: ToastrService,
    private fileService: FileService,
    private roundservice: RoundTypesService,
    private competitionService: CompetitionService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  transformYourHtml(htmlTextWithStyle: string) {
    return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
  }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.dataUndefined = true;
      return;
    }
    this.gameService.getGame(id).subscribe((game: ApiResponse<Game[]>) => {
      if (!game.data || game.data.length != 1) {
        this.toastr.error("Oops, something went wrong!", "Invalid game data");
        return;
      }
      this.game = game.data[0];
      this.game.game_description = unescape(this.game.game_description);
      this.game.submission_description = unescape(this.game.submission_description);
      this.newCompetition.game_id = this.game.id ?? '';
      this.decriptionEdit = this.transformYourHtml(this.game.game_description);
      this.sDecriptionEdit = this.transformYourHtml(this.game.submission_description);

      this.roundservice.getRoundTypes().subscribe((resp: ApiResponse<RoundType[]>) => {
        
        this.roundTypes = resp.data;
        this.newCompetition.active_round_type_id = this.roundTypes[0].id ?? '';

        this.competitionService.getCompetitionsByGame(this.game?.id ?? '').subscribe((resp: ApiResponse<Competition[]>) => {
        
          this.competitions = resp.data;
          this.dataReady = true;
        
        }, err => {
          this.toastr.error("Oops, something went wrong!", "Failed fetching comptetitions");
          console.log(err)  
          this.dataUndefined = true;
        });
      }, err => {
        this.toastr.error("Oops, something went wrong!", "Failed fetching round types");
        console.log(err)  
        this.dataUndefined = true;
      });
    }, err => {
      this.toastr.error("Oops, something went wrong!", "Invalid game");
      console.log(err)
      this.dataUndefined = true;
    });
  }


  getThumbnailUrl(): string {
    return this.fileService.getOpenFileUrl(this.game?.image_file_id ?? '');
  }

  downloadPack(): void {
    window.location.assign(this.fileService.getOpenFileDownloadUrl(this.game?.game_pack_file_id ?? ''));
  }

  saveDecriptionTemplate(): void {
    if (!this.game) {
      return;
    }
    this.game.game_description = escape(this.decriptionEdit as string ?? '');
    this.game.submission_description = escape(this.sDecriptionEdit as string ?? '');
    this.gameService.updateGame(this.game).subscribe((resp: ApiResponse<Game>) => {
      if (this.game) {
        this.game.game_description = unescape(this.game.game_description);
        this.game.submission_description = unescape(this.game.submission_description);
      }
      this.toastr.success('Updated template', 'Success');
    }, err => {
      console.log(err);
      this.toastr.error('Oops, something went wrong!', 'Error updating template!');
    })
  }

  activeCompetitions(): number {
    let count = 0;
    for (const competition of this.competitions) {
      if (this.isCompetitionRunning(competition)) {
        count++;
      }
    }
    return count;
  }

  isCompetitionRunning(competition: Competition): boolean {
    return new Date().getTime() >= new Date(competition.start).getTime() && 
      new Date().getTime() <= new Date(competition.end).getTime();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  createCompetition(): void {
    if (!this.newCompetition.competition_name) {
      this.toastr.error("Name missing", "Can not submit");
      return;
    }
    if (!this.newCompetition.start) {
      this.toastr.error("Competition start missing", "Can not submit");
      return;
    }
    if (!this.newCompetition.end) {
      this.toastr.error("Competition end missing", "Can not submit");
      return;
    }
    if (!this.newCompetition.active_round_type_id) {
      this.toastr.error("Round type missing", "Can not submit");
      return;
    }
    this.competitionService.submitCompetition(this.newCompetition).subscribe((resp: ApiResponse<Competition>) => {
      this.competitions.push(resp.data);
      this.competitionModalOpen = false;
      this.newCompetition = {
        game_id: this.game?.id ?? '',
        competition_name: '',
        start: '',
        end: '',
        banner_page: '',
        allowed_submissions: 0,
        active_round_type_id: ''
      };
      this.toastr.success("Competition created", "Success!");
    }, err => {
      this.toastr.error("Oops, something went wrong!", "Failed submiting comptetition");
      console.log(err);
    })
  }
  
  selectRound(value: string): void {
    this.newCompetition.active_round_type_id = value;
  }
  
  formatStartDate(event: any): void {
    this.newCompetition.start = event.target.value;
  }

  formatEndDate(event: any): void {
    this.newCompetition.end = event.target.value;
  }

  routeToCompetition(competition: Competition): void {
    this.router.navigate(['competition', competition.id]);
  }
}