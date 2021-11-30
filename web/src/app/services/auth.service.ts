import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalCredentials } from '../models/login-credentials';
import { ApiResponse } from '../models/response';
import { User } from '../models/user.model';
import { AuthResp } from '../models/auth-response.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth/ldap';
  private token = 'JWTtoken';
  private userString = 'user';
  private isAdminString = 'isAdmin';
 
  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  isLoggedIn(): boolean {
    if (!localStorage.getItem(this.token)) {
      return false;
    }
    return true;
  }

  isAdmin(): boolean {
    const val = localStorage.getItem(this.isAdminString);
    if (!val) {
      return false;
    }
    return val == 'true' ? true : false;
  }

  getJWTtoken(): string | null {
    return localStorage.getItem(this.token);
  }

  logout(): void {
    localStorage.removeItem(this.token);
    this.router.navigate(['/login'])
  }

  async loginLocal(credentials: LocalCredentials): Promise<boolean> {
    try {
      console.log("Attempting login")
      const response: ApiResponse<AuthResp> | undefined = await this.http.post<ApiResponse<AuthResp>>(this.apiUrl, credentials).toPromise();
      if (!response) {
        return false;
      }
      localStorage.setItem(
        this.token, 
        `Bearer ${response.data.token}`
      );
      localStorage.setItem(
        this.userString, 
        JSON.stringify(response.data.user)
      );
      localStorage.setItem(
        this.isAdminString, 
        JSON.stringify(response.data.admin)
      );
      this.router.navigate(['/']);
    } catch (error) {
      console.log(error)
      return false;
    }
    return true;
  }
}
