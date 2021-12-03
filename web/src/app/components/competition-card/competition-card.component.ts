import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { Game } from 'src/app/models/game.model';
import { FileService } from 'src/app/services/file.service';
import { ContestantService } from 'src/app/services/contestant.service';
import { ApiResponse } from 'src/app/models/response';
import { Contestant } from 'src/app/models/contestant.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-competition-card',
  templateUrl: './competition-card.component.html',
  styleUrls: ['./competition-card.component.sass']
})
export class CompetitionCardComponent implements OnChanges {

  @Input() public competition: Competition | undefined;
  @Input() public game: Game | undefined;
  public contestants: number = 0;

  constructor(
    private fileService: FileService,
    private contestantService: ContestantService,
    private toastr: ToastrService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.competition) {
      this.contestantService.getContestantsByCompetition(this.competition?.id ?? '').subscribe((resp: ApiResponse<Contestant[]>) => {
        this.contestants = resp.data.length;
      }, err => {
        this.toastr.error("Oops, something went wrong!", "Failed fetching contesants!");
      });
    }
  }

  getThumbnailUrl(): string {
    return this.fileService.getOpenFileUrl(this.game?.image_file_id ?? '');
  }
}
