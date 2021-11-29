import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LocalCredentials } from 'src/app/models/login-credentials';
import { AuthService } from 'src/app/services/auth.service';

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
  
  @Output() loginSuccess = new EventEmitter<boolean>();

  constructor(
    private auth: AuthService,
  ) { }

  ngOnInit() {}

  async login(): Promise<void> {
    const success: boolean = await this.auth.loginLocal(this.credentials);
    console.log(success);
    this.loginSuccess.emit(success);
  }

}
