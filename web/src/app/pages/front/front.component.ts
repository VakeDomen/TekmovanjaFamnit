import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Competition } from 'src/app/models/competition.model';
import { ApiResponse } from 'src/app/models/response';
import { CompetitionService } from 'src/app/services/competition.service';

@Component({
  selector: 'app-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.sass']
})
export class FrontComponent implements OnInit {

  public page: SafeHtml | undefined;

  constructor(
    private competitionService: CompetitionService,
    private sanitizer: DomSanitizer,
  ) { }

  transformYourHtml(htmlTextWithStyle: string) {
    return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
  }

  ngOnInit(): void {
    this.competitionService.getCompetitions().subscribe((resp: ApiResponse<Competition[]>) => {
      if (resp.data.length) {
        for (const dat of resp.data) {
          if ((dat as Competition).banner_page != '') {
            this.page = this.transformYourHtml(unescape(dat.banner_page));
            break;
          }
        }
      }
    });
  }

}
