import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Match } from '../models/match.model';
import { Prog1scores } from '../models/prog1scores.model';
import { ApiResponse } from '../models/response';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
    
  constructor(
    private cache: CacheService,
  ) { }

  getMatches(contestantId: string): Observable<ApiResponse<Match[]>> {
    return this.cache.getCached(`/match/contestant/${contestantId}`);
    // return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/contestant/${contestantId}`);
  }

  getRankedMatches(competitionId: string): Observable<ApiResponse<Match[]>> {
    return this.cache.getCached(`/match/ranked/${competitionId}`);
    // return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/contestant/${contestantId}`);
  }

  getProg1Score(contestantId: string): Observable<ApiResponse<Prog1scores[]>> {
    return this.cache.getCached(`/match/prog1/${contestantId}`);
  }

  getMatchesBySubmission(submissionId: string): Observable<ApiResponse<Match[]>> {
    return this.cache.getCached(`/match/submission/${submissionId}`);
    // return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/contestant/${contestantId}`);
  }

  getRankingMatches(competitionId: string): Observable<ApiResponse<Match[]>> {
    return this.cache.getCached(`/match/ranked/${competitionId}`);
    // return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/contestant/${contestantId}`);
  }

  isMatchWon(match: Match): boolean {
    return match.submission_id_2 != match.submission_id_winner
  }
}

