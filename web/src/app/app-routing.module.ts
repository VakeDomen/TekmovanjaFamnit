import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { CompetitionComponent } from './pages/competition/competition.component';
import { CompetitionsComponent } from './pages/competitions/competitions.component';
import { GameComponent } from './pages/game/game.component';
import { GamesComponent } from './pages/games/games.component';
import { LoginComponent } from './pages/login/login.component';
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
    component: CompetitionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'competitions',
    component: CompetitionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'competition/:id',
    component: CompetitionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'games',
    component: GamesComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'game/:id',
    component: GameComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
