import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { Game } from 'src/app/models/game.model';
import { FileService } from 'src/app/services/file.service';
import { ContestantService } from 'src/app/services/contestant.service';
import { ApiResponse } from 'src/app/models/response';
import { Contestant } from 'src/app/models/contestant.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contestant-card',
  templateUrl: './contestant-card.component.html',
  styleUrls: ['./contestant-card.component.sass']
})
export class ContestantCardComponent implements OnChanges {
  
  @Input() public competition: Competition | undefined;
  @Input() public game: Game | undefined;
  @Input() public contestant: Contestant | undefined;

  public contestants: number = 0;

  constructor(
    private fileService: FileService,
    private toastr: ToastrService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
  }

  getThumbnailUrl(): string {
    return this.fileService.getOpenFileUrl(this.game?.image_file_id ?? '');
  }
}
