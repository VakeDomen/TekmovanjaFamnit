import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { GamesService } from 'src/app/services/games.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {

  public game: Game | undefined;
  public dataUndefined: boolean = false;
  public dataReady: boolean = false;
  public modalOpen: boolean = false;

  public decriptionEdit: string | undefined;

  public tab: 'competitions' | 'description' = 'description';

  constructor(
    private route: ActivatedRoute,
    private gameService: GamesService,
    private toastr: ToastrService,
    private fileService: FileService,
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
      this.dataReady = true;
    }, err => {
      this.toastr.error("Oops, something went wrong!", "Invalid game");
      console.log(err)
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
    this.game.game_description = this.decriptionEdit ?? '';
    this.gameService.updateGame(this.game).subscribe((resp: ApiResponse<Game>) => {
      this.toastr.success('Updated template', 'Success');
    }, err => {
      console.log(err);
      this.toastr.error('Oops, something went wrong!', 'Error updating template!');
    })
  }

}
