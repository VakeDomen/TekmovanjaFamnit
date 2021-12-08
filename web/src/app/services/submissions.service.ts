import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Submission } from '../models/submission.model';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class SubmissionsService {
  private apiUrl = environment.apiUrl + '/submission';
  
  constructor(
    private http: HttpClient,
  ) { }

  getSubmissions(): Observable<ApiResponse<Submission[]>> {
    return this.http.get<ApiResponse<Submission[]>>(this.apiUrl);
  }

  getSubmissionsByCompetition(competitionId: string): Observable<ApiResponse<Submission[]>> {
    return this.http.get<ApiResponse<Submission[]>>(this.apiUrl + '?competition_id=' + competitionId);
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