import { Injectable, computed, effect, signal } from '@angular/core';
import { AuthResponse } from '@shared/models/user';

const KEY = 'miniloja.auth';

/**
 * Sessão do usuário (token JWT + dados). Persiste em localStorage e é restaurada ao iniciar.
 * As chamadas de login/cadastro ficam em features/auth/services.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
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

  startSession(res: AuthResponse): void { this.state.set(res); }
  logout(): void { this.state.set(null); }

  private load(): AuthResponse | null {
    try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; }
  }
}
