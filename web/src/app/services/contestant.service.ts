import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Contestant } from '../models/contestant.model';
import { ApiResponse } from '../models/response';
import { CacheService } from './cache.service';


@Injectable({
  providedIn: 'root'
})
export class ContestantService {

  private apiUrl = environment.apiUrl + '/contestant';
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  getContestants(): Observable<ApiResponse<Contestant[]>> {
    return this.http.get<ApiResponse<Contestant[]>>(this.apiUrl);
  }

  getContestantsByCompetition(competitionId: string): Observable<ApiResponse<Contestant[]>> {
    return this.http.get<ApiResponse<Contestant[]>>(this.apiUrl + '?competition_id=' + competitionId);
  }

  getContestant(id: string): Observable<ApiResponse<Contestant[]>> {
    return this.cache.getCached("/contestant/" + id);
  }

  submitContestant(contestant: Contestant): Observable<ApiResponse<Contestant>> {
    return this.http.post<ApiResponse<Contestant>>(this.apiUrl, contestant);
  }

  updateContestant(contestant: Contestant): Observable<ApiResponse<Contestant>> {
    return this.http.patch<ApiResponse<Contestant>>(this.apiUrl, contestant);
  }
}
