import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { Game } from 'src/app/models/game.model';
import { ApiResponse } from 'src/app/models/response';
import { AuthService } from 'src/app/services/auth.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { ContestantService } from 'src/app/services/contestant.service';
import { FileService } from 'src/app/services/file.service';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.sass']
})
export class CompetitionComponent implements OnInit {

  public dataReady: boolean = false;
  public dataUnavalible: boolean = false;
  public tab: 'open' | 'banner_edit' = 'open';

  public bannerEdit: string | undefined;
  public bannerDisplay: SafeHtml | undefined;

  public descriptionDisplay: SafeHtml | undefined;

  public previewModalOpen: boolean = false;

  public competition: Competition | undefined;
  public myContestant: Contestant | undefined;
  public contestants: Contestant[] = [];
  public game: Game | undefined;

  constructor(
    private competitionService: CompetitionService,
    private route: ActivatedRoute,
    private tostr: ToastrService,
    private contestatnService: ContestantService,
    private gameService: GamesService,
    private router: Router,
    private fileService: FileService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
  ) { }
  // ngAfterContentChecked(): void {
  //   const element = <HTMLElement>document.querySelector('.boundHTML');
  //   console.log(element)
  //   element.innerHTML = element.innerHTML.replace('SafeValue must use [property]=binding: ', '');
  //   element.innerHTML = element.innerHTML.replace(' (see https://g.co/ng/security#xss)', '');
  // }
  // ngAfterViewChecked(): void {
    
  // }

  transformYourHtml(htmlTextWithStyle: string) {
    return  (this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle) as string);
    //valHtml.replace('SafeValue must use [property]=binding: ', '').replace(' (see https://g.co/ng/security#xss)', '');
    //return valHtml as SafeHtml
  }


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.competitionService.getCompetition(id ?? '').subscribe((resp: ApiResponse<Competition[]>) => {
      if (resp.data.length) {
        this.competition = resp.data[0];
        this.bannerEdit = unescape(this.competition.banner_page);
        this.bannerDisplay = this.transformYourHtml(this.bannerEdit);
        this.contestatnService.getContestantsByCompetition(this.competition.id ?? '').subscribe((resp: ApiResponse<Contestant[]>) => {
          this.contestants = resp.data;
          this.myContestant = this.findMyContestant(this.contestants);
          this.gameService.getGame(this.competition?.game_id ?? '').subscribe((resp: ApiResponse<Game[]>) => {
            if (resp.data.length) {
              this.game = resp.data[0];
              this.game.game_description = unescape(this.game.game_description);
              this.descriptionDisplay = this.transformYourHtml(this.game?.game_description);
              this.dataReady = true;
            }
          }, err => {
            console.log(err);
            this.tostr.error("Oops, something went wrong", "Failed fetching game");
            this.dataUnavalible = true;
          })
        }, err => {
          console.log(err);
          this.tostr.error("Oops, something went wrong", "Failed fetching contestants");
          this.dataUnavalible = true;
        })
      } else {
        this.tostr.error("Oops, something went wrong", "Invalid response");
        this.dataUnavalible = true;
      }
    }, err => {
      console.log(err);
      this.tostr.error("Oops, something went wrong", "Failed fetching competition");
      this.dataUnavalible = true;
    });
  }

  refreshDisplayEdit(event: string) {
    this.bannerEdit = event;
    this.bannerDisplay = this.transformYourHtml(event);
  }

  findMyContestant(contestants: Contestant[]): Contestant | undefined {
    for (const con of contestants) {
      if (con.user_id == this.authService.getId()) {
        return con;
      }
    }
    return undefined;
  }
 
  routeToGame(): void {
    this.router.navigate(['game', this.game?.id ?? '']);
  }

  downloadPack(): void {
    window.location.assign(this.fileService.getOpenFileDownloadUrl(this.game?.game_pack_file_id ?? ''));
  }

  contestantJoined(contestant: Contestant): void {
    this.myContestant = contestant;
    this.contestants.push(contestant);
    if (this.competition && this.competition.contestants) {
      this.competition.contestants++;
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  

  saveBannerTemplate() {
    if (!this.competition) {
      return;
    }
    this.competition.banner_page = escape(this.bannerEdit as string ?? '');
    const tmp = this.competition.created;
    delete this.competition.created;
    this.competitionService.updateCompetition(this.competition).subscribe((resp: ApiResponse<Competition>) => {
      if (this.competition) {
        this.competition.banner_page = unescape(this.competition.banner_page);
        this.competition.created = tmp;
      }
      this.tostr.success('Updated template', 'Success');
    }, err => {
      console.log(err);
      this.tostr.error('Oops, something went wrong!', 'Error updating template!');
    })
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
