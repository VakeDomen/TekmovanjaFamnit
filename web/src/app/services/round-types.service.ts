import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/response';
import { RoundType } from '../models/round-type.model';

@Injectable({
  providedIn: 'root'
})
export class RoundTypesService {
  private apiUrl = environment.apiUrl + '/round-type';
  
  constructor(
    private http: HttpClient
  ) { }

  getRoundTypes(): Observable<ApiResponse<RoundType[]>> {
    return this.http.get<ApiResponse<RoundType[]>>(this.apiUrl);
  }

}
