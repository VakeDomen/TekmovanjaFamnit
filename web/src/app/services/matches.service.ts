import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Match } from '../models/match.model';
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

  getMatchesBySubmission(submissionId: string): Observable<ApiResponse<Match[]>> {
    return this.cache.getCached(`/match/submission/${submissionId}`);
    // return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/contestant/${contestantId}`);
  }
}

