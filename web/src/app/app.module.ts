import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';
import { GameComponent } from './pages/game/game.component';
import { CompetitionsComponent } from './pages/competitions/competitions.component';
import { CompetitionComponent } from './pages/competition/competition.component';
import { ContestantComponent } from './pages/contestant/contestant.component';
import { CompetitionCardComponent } from './components/competition-card/competition-card.component';
import { JoinCompetitionModalComponent } from './components/join-competition-modal/join-competition-modal.component';
import { SubmissionsComponent } from './pages/submissions/submissions.component';
import { SubmissionComponent } from './pages/submission/submission.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    LocalAuthComponent,
    GamesComponent,
    FileInputComponent,
    GameComponent,
    CompetitionsComponent,
    CompetitionComponent,
    ContestantComponent,
    CompetitionCardComponent,
    JoinCompetitionModalComponent,
    SubmissionsComponent,
    SubmissionComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: function(router: Router, auth: AuthService, toastr: ToastrService) {
        return new AuthInterceptor(router, auth, toastr);
      },
      multi: true,
      deps: [Router, AuthService, ToastrService]
   },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
