import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { LocalAuthComponent } from './components/local-auth/local-auth.component';
import { AboutComponent } from './pages/about/about.component';
import { CompetitionComponent } from './pages/competition/competition.component';
import { CompetitionsComponent } from './pages/competitions/competitions.component';
import { FrontComponent } from './pages/front/front.component';
import { GameComponent } from './pages/game/game.component';
import { GamesComponent } from './pages/games/games.component';
import { LoginComponent } from './pages/login/login.component';
import { ReportComponent } from './pages/report/report.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { SubmissionComponent } from './pages/submission/submission.component';
import { SubmissionsComponent } from './pages/submissions/submissions.component';
import { AdminGuard } from './services/admin.guard';
import { AuthGuard } from './services/auth.guard';

const routerOptions: ExtraOptions = {
  useHash: false,
  anchorScrolling: 'enabled',
  // ...any other options you'd like to use
};

const routes: Routes = [
  {
    path: '',
    component: FrontComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'report',
    component: ReportComponent,
  },
  {
    path: 'competitions',
    component: CompetitionsComponent,
  },
  {
    path: 'competition/:id',
    component: CompetitionComponent,
  },
  {
    path: 'contestants',
    component: SubmissionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'contestant/:id',
    component: SubmissionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'games',
    component: GamesComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'stats',
    component: StatisticsComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'game/:id',
    component: GameComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LocalAuthComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
