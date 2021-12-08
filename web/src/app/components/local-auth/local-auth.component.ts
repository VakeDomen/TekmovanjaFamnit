import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-local-auth',
  templateUrl: './local-auth.component.html',
  styleUrls: ['./local-auth.component.sass']
})
export class LocalAuthComponent implements OnChanges {

  modalOpen: boolean = false;
  @Input() isPage: boolean = true;

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
  ) { }

  ngOnChanges() {
    console.log('ispage', this.isPage)
  }

  handleLoginAttempt(success: any): void {
    if (success) {
      this.modalOpen = false;
    }
  }

  handleRegistrationAttempt(success: any): void {
    if (success) {
      this.modalOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastr.success("Logged out!", "Success");
  }

}