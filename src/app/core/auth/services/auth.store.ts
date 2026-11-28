import { Injectable, computed, effect, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../../shared/models/user';

const KEY = 'miniloja.auth';
const MOCK_TOKEN = 'mock-token';
const MOCK: AuthResponse = { token: MOCK_TOKEN, user: { id: 0, name: 'João Pedro Fuhr', email: 'joao@exemplo.com', role: 'USER' } };

/** Sessão do usuário (token JWT + dados). Persiste em localStorage e restaura ao iniciar. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly state = signal<AuthResponse | null>(this.load());

  readonly token = computed(() => this.state()?.token ?? null);
  readonly user = computed(() => this.state()?.user ?? null);
  readonly isLoggedIn = computed(() => this.state() !== null);
  readonly isAdmin = computed(() => this.state()?.user.role === 'ADMIN');
  readonly firstName = computed(() => this.user()?.name.split(' ')[0] ?? '');

  constructor() {
    effect(() => {
      const s = this.state();
      if (s?.token === MOCK_TOKEN) return; // o usuário fictício não é gravado
      try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* storage indisponível */ }
    });
  }

  login(res: AuthResponse): void { this.state.set(res); }
  logout(): void { this.state.set(null); }

  private load(): AuthResponse | null {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved) return saved;
    } catch { /* storage indisponível */ }
    return environment.mockUser ? MOCK : null;
  }
}
