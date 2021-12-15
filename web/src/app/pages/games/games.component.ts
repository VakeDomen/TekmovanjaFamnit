import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FileModel } from 'src/app/models/file.model';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { FileService } from 'src/app/services/file.service';
import { GamesService } from 'src/app/services/games.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.sass']
})
export class GamesComponent implements OnInit {

  public games: Game[] = [];
  public modalOpen: boolean = false;
  public thumbnail: File | null = null;
  public gamePack: File | null = null;
  public newGame: Game = {
    name: '',
    image_file_id: '',
    game_pack_file_id: '',
    game_description: '',
    submission_description: '',
  }

  constructor(
    private gamesService: GamesService,
    private fileService: FileService,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.gamesService.getGames().subscribe((resp: ApiResponse<Game[]>) => {
      this.games = resp.data;
    });
  }
  prepareThumbnail(file: File): void {
    this.thumbnail = file;
  }
  
  prepareGamePack(file: File): void {
    this.gamePack = file;
  }

  prepareDescription(description: any): void {
    this.newGame.game_description = escape(description.target.value);
  }

  getThumbnailUrl(game: Game): string {
    return this.fileService.getOpenFileUrl(game.image_file_id);
  }

  cardSelected(game: Game): void {
    this.router.navigate(['game', game.id]);
  }

  saveGame(): void {
    if (!this.thumbnail) {
      this.toastr.error("Please submit a thumbnail!", "Missing field");
      return;
    }
    if (!this.gamePack) {
      this.toastr.error("Please submit a game pack!", "Missing field");
      return;
    }
    if (this.newGame.name == '') {
      this.toastr.error("Please enter a game name!", "Missing field");
      return
    }
    if (this.newGame.game_description == '') {
      this.toastr.error("Please submit a description template!", "Missing field");
      return
    }
    this.fileService.postGamePack(this.gamePack as File, this.newGame.name).subscribe((resp: ApiResponse<FileModel>) => {
      this.newGame.game_pack_file_id = resp.data.id ?? '';
      this.fileService.postThumbnail(this.thumbnail as File, this.newGame.name).subscribe((resp: ApiResponse<FileModel>) => {
        this.newGame.image_file_id = resp.data.id ?? '';
        this.gamesService.submitGame(this.newGame).subscribe((resp: ApiResponse<Game>) => {
          this.games.push(resp.data);
          this.toastr.success("Game submited!", "Saved");
          this.modalOpen = false;
        }, (err: any) => {
          console.log('game uplooad err', err);
          this.toastr.error("Oops, something went wrong!", "Error uploading game");
        });
      }, (err: any) => {
        console.log('thumbnail upload err', err);
        this.toastr.error("Oops, something went wrong!", "Error uploading thumbnail");
      });
    }, (err: any) => {
      console.log('pack upload err', err);
      this.toastr.error("Oops, something went wrong!", "Error uploading game pack");
    });
  }
}
