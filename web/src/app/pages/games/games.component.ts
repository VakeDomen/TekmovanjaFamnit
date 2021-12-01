import { convertPropertyBindingBuiltins } from '@angular/compiler/src/compiler_util/expression_converter';
import { Component, OnInit } from '@angular/core';
import { FileModel } from 'src/app/models/file.model';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { FileService } from 'src/app/services/file.service';
import { GamesService } from 'src/app/services/games.service';

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
  }

  constructor(
    private gamesService: GamesService,
    private fileService: FileService,
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
    console.log(description)
    this.newGame.game_description = escape(description.target.value);
  }

  saveGame(): void {
    if (!this.thumbnail) {
      console.log('thb', this.thumbnail)
      return;
    }
    if (!this.gamePack) {
      console.log('gpck', this.gamePack)
      return;
    }
    if (this.newGame.name == '') {
      console.log('name', this.newGame.name)
      return
    }
    if (this.newGame.game_description == '') {
      console.log('desc', this.newGame.game_description)
      return
    }
    this.fileService.postGamePack(this.gamePack as File, this.newGame.name).subscribe((resp: ApiResponse<FileModel>) => {
      this.newGame.game_pack_file_id = resp.data.id ?? '';
      this.fileService.postThumbnail(this.thumbnail as File, this.newGame.name).subscribe((resp: ApiResponse<FileModel>) => {
        this.newGame.image_file_id = resp.data.id ?? '';
        this.gamesService.submitGame(this.newGame).subscribe((resp: ApiResponse<Game>) => {
          this.games.push(resp.data);
        }, (err: any) => {
          console.log('game uplooad err', err);
        });
      }, (err: any) => {
        console.log('thumbnail upload err', err);
      });
    }, (err: any) => {
      console.log('pack upload err', err);
    });
  }
}
