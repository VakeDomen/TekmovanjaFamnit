import { Component, OnInit } from '@angular/core';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.sass']
})
export class GamesComponent implements OnInit {

  public games: Game[] = [];

  constructor(
    private gamesService: GamesService,
  ) { }

  ngOnInit(): void {
    this.gamesService.getGames().subscribe((resp: ApiResponse<Game[]>) => {
      this.games = resp.data;
    });
  }

}
