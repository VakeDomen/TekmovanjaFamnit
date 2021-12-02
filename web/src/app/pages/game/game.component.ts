import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { GamesService } from 'src/app/services/games.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from 'src/app/services/file.service';
import { Competition } from 'src/app/models/competition.model';
import { DatePipe } from '@angular/common';
import { RoundTypesService } from 'src/app/services/round-types.service';
import { RoundType } from 'src/app/models/round-type.model';
import { CompetitionService } from 'src/app/services/competition.service';
import { AuthService } from 'src/app/services/auth.service';

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
  public competitionModalOpen: boolean = false;

  public decriptionEdit: string | undefined;
  public newCompetition: Competition = {
    game_id: '',
    competition_name: '',
    start: '',
    end: '',
    allowed_submissions: 0,
    active_round_type_id: ''
  }

  public tab: 'competitions' | 'description' = 'description';

  constructor(
    private route: ActivatedRoute,
    private gameService: GamesService,
    private toastr: ToastrService,
    private fileService: FileService,
    private roundservice: RoundTypesService,
    private competitionService: CompetitionService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
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
      this.decriptionEdit = this.game.game_description;
      this.roundservice.getRoundTypes().subscribe((resp: ApiResponse<RoundType[]>) => {
        this.roundTypes = resp.data;
        this.competitionService.getCompetitions().subscribe((resp: ApiResponse<Competition[]>) => {
          this.competitions = resp.data;
          this.dataReady = true;
        }, err => {
          this.toastr.error("Oops, something went wrong!", "Failed fething comptetitions");
          console.log(err)  
          this.dataUndefined = true;
        });
      }, err => {
        this.toastr.error("Oops, something went wrong!", "Failed fething round types");
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
    this.game.game_description = escape(this.decriptionEdit ?? '');
    this.gameService.updateGame(this.game).subscribe((resp: ApiResponse<Game>) => {
      if (this.game) {
        this.game.game_description = unescape(this.game.game_description);
      }
      this.toastr.success('Updated template', 'Success');
    }, err => {
      console.log(err);
      this.toastr.error('Oops, something went wrong!', 'Error updating template!');
    })
  }

  activeCompetitions(): number {
    let count = 0;
    let date = new Date();
    for (const competition of this.competitions) {
      if (
        date.getTime() >= new Date(competition.start).getTime() && 
        date.getTime() <= new Date(competition.end).getTime()
      ) {
        count++;
      }
    }
    return count;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  createCompetition(): void {
    console.log(this.newCompetition);
    if (!this.newCompetition.competition_name) {
      this.toastr.error("Name missing", "Can not submit");
    }
    if (!this.newCompetition.start) {
      this.toastr.error("Competition start missing", "Can not submit");
    }
    if (!this.newCompetition.end) {
      this.toastr.error("Competition end missing", "Can not submit");
    }
    if (!this.newCompetition.active_round_type_id) {
      this.toastr.error("Round type missing", "Can not submit");
    }
    this.competitionService.submitCompetition(this.newCompetition).subscribe((resp: ApiResponse<Competition>) => {
      this.competitions.push(resp.data);
      this.competitionModalOpen = false;
      this.newCompetition = {
        game_id: '',
        competition_name: '',
        start: '',
        end: '',
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
}