import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LocalAuthComponent } from './components/local-auth/local-auth.component';
import { GamesComponent } from './pages/games/games.component';
import { FileInputComponent } from './components/file-input/file-input.component';
import { Router } from '@angular/router';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    LocalAuthComponent,
    GamesComponent,
    FileInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: function(router: Router, auth: AuthService) {
        return new AuthInterceptor(router, auth);
      },
      multi: true,
      deps: [Router, AuthService]
   },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
