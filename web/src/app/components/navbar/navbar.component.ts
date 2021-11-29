import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit {
  
  activeTab: string = 'games';
  @Output() tab = new EventEmitter<string>();

  @ViewChild('navBurger', {static: true}) navBurger?: ElementRef;
  @ViewChild('navMenu', {static: true}) navMenu?: ElementRef;



  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  toggleNavbar() {
    this.navBurger ? this.navBurger.nativeElement.classList.toggle('is-active'):'';
    this.navMenu ? this.navMenu.nativeElement.classList.toggle('is-active') : '';
  }
}