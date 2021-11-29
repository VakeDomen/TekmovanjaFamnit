import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Game } from '../models/game.model';
import { ApiResponse } from '../models/response';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  
  private apiUrl = environment.apiUrl + '/game';
  
  constructor(
    private http: HttpService
  ) { }

  getGames(): Observable<ApiResponse<Game[]>> {
    return this.http.get<ApiResponse<Game[]>>(this.apiUrl);
  }
}
