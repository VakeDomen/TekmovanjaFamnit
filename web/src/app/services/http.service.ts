import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(
        private http: HttpClient,
        private auth: AuthService,
    ) { }

    generateAuthorizationHeader(): {headers: HttpHeaders} {
        if (this.auth.isLoggedIn()) {
            return {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Credentials': 'true',
                    'Authorization': this.auth.getJWTtoken() ?? ''
                })
            };
        } else {
            return {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Credentials': 'true',
                }),
            };
        }
    }

    get<T>(url: string): Observable<T> {
        return this.http.get<T>(url, this.generateAuthorizationHeader());
    }

    post<T>(url: string, data: any): Observable<T> {
        return this.http.post<T>(url, data, this.generateAuthorizationHeader());
    }

    patch<T>(url: string, data: any): Observable<T> {
        this.generateAuthorizationHeader();
        return this.http.patch<T>(url, data, this.generateAuthorizationHeader());
    }

    delete<T>(url: string): Observable<T> {
        this.generateAuthorizationHeader();
        return this.http.delete<T>(url, this.generateAuthorizationHeader());
    }
}