import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-local-auth',
  templateUrl: './local-auth.component.html',
  styleUrls: ['./local-auth.component.sass']
})
export class LocalAuthComponent implements OnChanges {

  modalOpen: boolean = false;
  @Input() isPage: boolean = true;
  @Output() modalClosedEvent = new EventEmitter();

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnChanges() {
  }

  handleLoginAttempt(success: any): void {
    if (success) {
      this.modalClose();
      this.router.navigateByUrl(this.route.snapshot.queryParams['returnUrl'] || '/');
    }
  }

  handleRegistrationAttempt(success: any): void {
    if (success) {
      this.modalClose()
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastr.success("Logged out!", "Success");
    this.modalClose()
  }

  modalClose() {
    this.modalClosedEvent.emit();
    this.modalOpen = false;
  }
}