import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Competition } from '../models/competition.model';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = environment.apiUrl + '/competition';
  
  constructor(
    private http: HttpClient,
  ) { }

  getCompetitions(): Observable<ApiResponse<Competition[]>> {
    return this.http.get<ApiResponse<Competition[]>>(this.apiUrl);
  }

  getCompetitionsByGame(gameId: string): Observable<ApiResponse<Competition[]>> {
    return this.http.get<ApiResponse<Competition[]>>(this.apiUrl + '?game_id=' + gameId);
  }

  getCompetition(id: string): Observable<ApiResponse<Competition[]>> {
    return this.http.get<ApiResponse<Competition[]>>(this.apiUrl + "/" + id);
  }

  submitCompetition(competition: Competition): Observable<ApiResponse<Competition>> {
    return this.http.post<ApiResponse<Competition>>(this.apiUrl, competition);
  }

  updateCompetition(competition: Competition): Observable<ApiResponse<Competition>> {
    return this.http.patch<ApiResponse<Competition>>(this.apiUrl, competition);
  }
}
