import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Submission } from '../models/submission.model';
import { ApiResponse } from '../models/response';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class SubmissionsService {
  private apiUrl = environment.apiUrl + '/submission';
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  getSubmissions(): Observable<ApiResponse<Submission[]>> {
    return this.http.get<ApiResponse<Submission[]>>(this.apiUrl);
  }

  getSubmissionsByContestant(contestantId: string): Observable<ApiResponse<Submission[]>> {
    return this.cache.getCached("/submission/contestant/" + contestantId);
  }

  getSubmission(id: string): Observable<ApiResponse<Submission[]>> {
    return this.http.get<ApiResponse<Submission[]>>(this.apiUrl + "/" + id);
  }

  submitSubmission(submission: Submission): Observable<ApiResponse<Submission>> {
    return this.http.post<ApiResponse<Submission>>(this.apiUrl, submission);
  }

  updateSubmission(submission: Submission): Observable<ApiResponse<Submission>> {
    return this.http.patch<ApiResponse<Submission>>(this.apiUrl, submission);
  }
}
