import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Competition } from 'src/app/models/competition.model';
import { Contestant } from 'src/app/models/contestant.model';
import { ApiResponse } from 'src/app/models/response';
import { AuthService } from 'src/app/services/auth.service';
import { ContestantService } from 'src/app/services/contestant.service';

@Component({
  selector: 'app-join-competition-modal',
  templateUrl: './join-competition-modal.component.html',
  styleUrls: ['./join-competition-modal.component.sass']
})
export class JoinCompetitionModalComponent implements OnInit {

  @Input() competition: Competition | undefined = undefined;
  @Output() newContestant: EventEmitter<Contestant> = new EventEmitter();

  modalOpen: boolean = false;

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private contestantService: ContestantService
  ) { }

  ngOnInit(): void {
  }

  joinContest(): void {
    if (!this.competition || !this.competition.id) {
      this.toastr.error("Invalid competition", "Failed");
      return;
    }
    const id = this.authService.getId();
    if (!id) {
      console.log(id);
      this.toastr.error("Invalid player", "Failed");
      return;
    }
    const contestant: Contestant = {
      user_id: id,
      competition_id: this.competition.id,
    };
    this.contestantService.submitContestant(contestant).subscribe((resp: ApiResponse<Contestant>) => {
      this.newContestant.emit(resp.data);
      this.toastr.success("Joined competition!", "Success!");
    }, err => {
      console.log(err);
      this.toastr.error("Oops, something went wrong", "Failed joining competition");
    })
    this.modalOpen = false;
  }
}
