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
import { CompetitionCardComponent } from './components/competition-card/competition-card.component';
import { JoinCompetitionModalComponent } from './components/join-competition-modal/join-competition-modal.component';
import { SubmissionsComponent } from './pages/submissions/submissions.component';
import { SubmissionComponent } from './pages/submission/submission.component';
import { ContestantCardComponent } from './components/contestant-card/contestant-card.component';
import { ChartsPanelComponent } from './components/charts-panel/charts-panel.component';
import { SubmissionWinRateChartComponent } from './components/charts/submission-win-rate-chart/submission-win-rate-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ScoreChartComponent } from './components/charts/score-chart/score-chart.component';
import { RadarStatsChartComponent } from './components/charts/radar-stats-chart/radar-stats-chart.component';
import { RoundsChartComponent } from './components/charts/rounds-chart/rounds-chart.component';
import { AboutComponent } from './pages/about/about.component';
import { FrontComponent } from './pages/front/front.component';
import { FooterComponent } from './components/footer/footer.component';
import {NgcCookieConsentModule, NgcCookieConsentConfig} from 'ngx-cookieconsent';
import { ReportComponent } from './pages/report/report.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { ScoreChartGlobalComponent } from './components/charts/score-chart-global/score-chart.component';
import { SubmissionCountChartComponent } from './components/charts/submission-count-chart/submission-count-chart.component';
import { RankingsComponent } from './pages/rankings/rankings.component';

const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: 'tekmovanje.famnit.upr.si' // or 'your.domain.com' 
  },
  palette: {
    popup: {
      background: '#363636'
    },
    button: {
      background: '#00D1B2'
    }
  },
  theme: 'edgeless',
  type: 'opt-out'
};


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
    CompetitionCardComponent,
    JoinCompetitionModalComponent,
    SubmissionsComponent,
    SubmissionComponent,
    ContestantCardComponent,
    ChartsPanelComponent,
    SubmissionWinRateChartComponent,
    ScoreChartComponent,
    RoundsChartComponent,
    ScoreChartGlobalComponent,
    RadarStatsChartComponent,
    AboutComponent,
    FrontComponent,
    FooterComponent,
    ReportComponent,
    StatisticsComponent,
    SubmissionCountChartComponent,
    RankingsComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(),
    BrowserModule,
    NgApexchartsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgcCookieConsentModule.forRoot(cookieConfig)
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
