import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/navigation.service';
import { User } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {

  currentUser: User = new User;

  constructor(
    private userService: UserService,
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe
    (res => {
      this.currentUser = res;
      console.log(this.currentUser);
    },
    err => {
      this.navigationService.goLogin();
    });
  }

  goHome() {
    this.navigationService.goHome();
  }

}