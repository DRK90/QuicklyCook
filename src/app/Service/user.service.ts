import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private userIdSubject = new BehaviorSubject<string | null>(null);
  userId$ = this.userIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  setUserId(userId: string): void {
    this.userIdSubject.next(userId);
  }

  getUserId(): string | null {
    return this.userIdSubject.getValue();
  }
}
