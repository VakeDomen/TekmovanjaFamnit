import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Game } from '../models/game.model';
import { ApiResponse } from '../models/response';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  
  private apiUrl = environment.apiUrl + '/game';
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  getGames(): Observable<ApiResponse<Game[]>> {
    return this.http.get<ApiResponse<Game[]>>(this.apiUrl);
  }

  getGame(id: string): Observable<ApiResponse<Game[]>> {
    return this.cache.getCached("/game/" + id);
  }

  submitGame(game: Game): Observable<ApiResponse<Game>> {
    return this.http.post<ApiResponse<Game>>(this.apiUrl, game);
  }

  updateGame(game: Game): Observable<ApiResponse<Game>> {
    return this.http.patch<ApiResponse<Game>>(this.apiUrl, game);
  }
}
