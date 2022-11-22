import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IdentifiedMatch } from '../models/identified-match.model';
import { Match } from '../models/match.model';
import { Prog1scores } from '../models/prog1scores.model';
import { ApiResponse } from '../models/response';
import { Submission } from '../models/submission.model';
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

  isMatchWonUnidentified(match: Match, pl: 0 | 1): boolean {
    if (pl == 0) return match.submission_id_2 != match.submission_id_winner;
    else return match.submission_id_1 != match.submission_id_winner;
  }
  isMatchWon(match: IdentifiedMatch): boolean {
    if (match.me == 0) return match.submission_id_2 != match.submission_id_winner;
    else return match.submission_id_1 != match.submission_id_winner;
  }

  identifyMathces(matches: Match[], submissions: Submission[]): IdentifiedMatch[] {
    const ims = [];
    for (const m of matches) {
      const im = m as IdentifiedMatch;
      this.identifyMatch(im, submissions);
      ims.push(im);
    }
    return ims;
  }

  identifyMatch(im: IdentifiedMatch, submissions: Submission[]) {
    const submissionIds = submissions.map(s => s.id);
    if (submissionIds.includes(im.submission_id_1)) {
      im.me = 0;
    }
    if (submissionIds.includes(im.submission_id_2)) {
      im.me = 1;
    }
  }
}

