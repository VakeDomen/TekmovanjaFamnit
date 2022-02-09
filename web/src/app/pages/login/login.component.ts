import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LocalCredentials } from 'src/app/models/login-credentials';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  public credentials: LocalCredentials = {
    username: '',
    password: ''
  };
  
  @Output() loginSuccess = new EventEmitter();

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {}

  async login(): Promise<void> {
    const success: boolean = await this.auth.loginLocal(this.credentials);
    if (success) {
      this.toastr.success('Logged in!', 'Success');
    } else {
      this.toastr.error('Oops, something went wrong!', 'Error');
    }
    this.loginSuccess.emit(success);
  }

}
