import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-local-auth',
  templateUrl: './local-auth.component.html',
  styleUrls: ['./local-auth.component.sass']
})
export class LocalAuthComponent implements OnInit {

  modalOpen: boolean = false;
  @Input() isPage: boolean = true;

  constructor(
    public authService: AuthService,
  ) { }

  ngOnInit() {
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

}