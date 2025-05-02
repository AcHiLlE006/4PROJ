import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { env } from 'process';

interface LoginResponse {
  access_token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${process.env.API_URL}/auth`;  

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => localStorage.setItem('token', res.access_token)),
        map(() => void 0)
      );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  register(username: string,email: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(`${process.env.API_URL}/auth/signup`, { email, password })
      .pipe(
        map(() => void 0)
      );
    }
}
