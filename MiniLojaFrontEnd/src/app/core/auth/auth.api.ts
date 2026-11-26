import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthResponse, UserProfile } from '../../shared/models/user';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  login(body: { email: string; password: string }) { return this.http.post<AuthResponse>(`${this.url}/auth/login`, body); }
  register(body: { name: string; email: string; password: string }) { return this.http.post<AuthResponse>(`${this.url}/auth/register`, body); }
  me() { return this.http.get<UserProfile>(`${this.url}/users/me`); }
}
