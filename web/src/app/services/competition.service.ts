import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Competition } from '../models/competition.model';
import { ApiResponse } from '../models/response';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = environment.apiUrl + '/competition';
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  getCompetitions(): Observable<ApiResponse<Competition[]>> {
    return this.http.get<ApiResponse<Competition[]>>(this.apiUrl);
  }

  getCompetingCompetitions() {
    return this.http.get<ApiResponse<Competition[]>>(this.apiUrl + "/competing");
  }

  getRunningCompetitions(): Observable<ApiResponse<Competition[]>> {
    return this.http.get<ApiResponse<Competition[]>>(this.apiUrl + "/running");
  }

  getCompetitionsByGame(gameId: string): Observable<ApiResponse<Competition[]>> {
    return this.http.get<ApiResponse<Competition[]>>(this.apiUrl + '?game_id=' + gameId);
  }

  getCompetition(id: string): Observable<ApiResponse<Competition[]>> {
    return this.cache.getCached("/competition/" + id);
  }

  submitCompetition(competition: Competition): Observable<ApiResponse<Competition>> {
    return this.http.post<ApiResponse<Competition>>(this.apiUrl, competition);
  }

  updateCompetition(competition: Competition): Observable<ApiResponse<Competition>> {
    return this.http.patch<ApiResponse<Competition>>(this.apiUrl, competition);
  }
}
