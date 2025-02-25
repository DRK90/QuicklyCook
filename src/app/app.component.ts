import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CookieService } from './Service/cookie.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { UserService } from './Service/user.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent implements OnInit {
  userId: string | null = null;
  apiUrl = environment.apiUrl;

  constructor(private cookieService: CookieService, private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.userId = this.cookieService.getCookie('userId');
    
    if (!this.userId) {
      this.http.get<any>(`${this.apiUrl}/Auth/generate-user-id`).subscribe((response) => {
        this.userId = response.userId;
        if (this.userId) {
          this.cookieService.setCookie('userId', this.userId, 365);
          this.userService.setUserId(this.userId);
        }
      });
    } else {
      this.userService.setUserId(this.userId);
    }
  }
}
