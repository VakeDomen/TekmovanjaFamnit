import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiUrl + '/report/bug';
  
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) { }

  sendReport(report: string) {
    const name = this.auth.getName();
    return this.http.post(this.apiUrl, {name: name, message: report});
  }
}
