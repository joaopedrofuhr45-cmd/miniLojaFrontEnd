import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { AuthResponse } from '@shared/models/user';

/** Chamadas de login e cadastro ao back. A sessão em si fica no AuthService (core). */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth`;

  login(body: { email: string; password: string }) { return this.http.post<AuthResponse>(`${this.url}/login`, body); }
  register(body: { name: string; email: string; password: string }) { return this.http.post<AuthResponse>(`${this.url}/register`, body); }
}
