import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';
import { AuthResponse } from '@shared/models/user';
import { ServerError, toServerError } from '@shared/utils/server-error';

/** Entrar / cadastrar: chama o back, abre a sessão e redireciona. Devolve os erros por campo para o formulário marcar. */
@Injectable()
export class AuthFlowFacade {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly busy = signal(false);
  readonly loginError = signal('');
  readonly registerError = signal('');

  login(email: string, password: string): Promise<ServerError | null> {
    this.loginError.set('');
    return this.run(this.auth.login({ email, password }), this.loginError, 'E-mail ou senha inválidos');
  }

  register(name: string, email: string, password: string): Promise<ServerError | null> {
    this.registerError.set('');
    return this.run(this.auth.register({ name, email, password }), this.registerError, 'Não foi possível criar a conta');
  }

  private async run(request: ReturnType<AuthService['login']>, target: ReturnType<typeof signal<string>>, fallback: string): Promise<ServerError | null> {
    this.busy.set(true);
    try {
      this.done(await firstValueFrom(request));
      return null;
    } catch (e) {
      const err = toServerError(e as HttpErrorResponse, fallback);
      target.set(err.message);
      this.busy.set(false);
      return err;
    }
  }

  private done(res: AuthResponse): void {
    this.auth.startSession(res);
    const back = this.route.snapshot.queryParamMap.get('returnUrl');
    // só aceita caminho interno (evita open redirect via ?returnUrl=//site-malicioso)
    this.router.navigateByUrl(back && back.startsWith('/') && !back.startsWith('//') ? back : '/catalogo');
  }
}
