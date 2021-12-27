import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Match } from '../models/match.model';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  
  private apiUrl = environment.apiUrl + '/match';
  
  constructor(
    private http: HttpClient
  ) { }

  getMatches(contestantId: string): Observable<ApiResponse<Match[]>> {
    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/contestant/${contestantId}`);
  }
}

