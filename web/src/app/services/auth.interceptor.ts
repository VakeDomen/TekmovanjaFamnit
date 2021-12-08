import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, of, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    
    constructor(
        private router: Router,
        private auth: AuthService,    
        private toastr: ToastrService,
    ) { }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request to add the new header.
        const authReq = req.clone(this.generateAuthorizationHeader());
        // Pass on the cloned request instead of the original request.
        return next.handle(authReq).pipe(catchError(x => this.handleAuthError(x)));
    }

    private handleAuthError(err: HttpErrorResponse): Observable<any> {
        //handle your auth error or rethrow
        if (err.status === 401 || err.status === 403) {
            //navigate /delete cookies or whatever
            this.auth.logout();
            this.toastr.error('Redirecting to login!', 'Authentication session invalid!');
            this.router.navigateByUrl(`/login`);
            // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
        }
        return throwError(err)
    }


    
    private generateAuthorizationHeader(): {headers: HttpHeaders} {
        if (this.auth.isLoggedIn()) {
            return {
                headers: new HttpHeaders({
                    'Access-Control-Allow-Credentials': 'true',
                    'Authorization': this.auth.getJWTtoken() ?? ''
                })
            };
        } else {
            return {
                headers: new HttpHeaders({
                    'Access-Control-Allow-Credentials': 'true',
                }),
            };
        }
    }    

}