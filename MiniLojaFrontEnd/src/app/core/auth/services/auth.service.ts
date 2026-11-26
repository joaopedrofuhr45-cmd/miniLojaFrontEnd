import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { environment } from '@environment/environment';
import { AuthResponse, UserProfile } from '@shared/models/user';

const KEY = 'miniloja.auth';

/**
 * Autenticação: chamadas ao back (login, cadastro, perfil) e sessão do usuário (token JWT + dados),
 * que persiste em localStorage e é restaurada ao iniciar.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  private readonly state = signal<AuthResponse | null>(this.load());

  readonly token = computed(() => this.state()?.token ?? null);
  readonly user = computed(() => this.state()?.user ?? null);
  readonly isLoggedIn = computed(() => this.state() !== null);
  readonly isAdmin = computed(() => this.state()?.user.role === 'ADMIN');
  readonly firstName = computed(() => this.user()?.name.split(' ')[0] ?? '');

  constructor() {
    effect(() => {
      const s = this.state();
      try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* storage indisponível */ }
    });
  }

  // ── back ──
  login(body: { email: string; password: string }) { return this.http.post<AuthResponse>(`${this.url}/auth/login`, body); }
  register(body: { name: string; email: string; password: string }) { return this.http.post<AuthResponse>(`${this.url}/auth/register`, body); }
  me() { return this.http.get<UserProfile>(`${this.url}/users/me`); }

  // ── sessão ──
  startSession(res: AuthResponse): void { this.state.set(res); }
  logout(): void { this.state.set(null); }

  private load(): AuthResponse | null {
    try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; }
  }
}
