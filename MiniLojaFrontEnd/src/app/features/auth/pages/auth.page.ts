import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth.api';
import { AuthStore } from '../../../core/auth/auth.store';
import { ApiError } from '../../../shared/models/api-error';
import { AuthResponse } from '../../../shared/models/user';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { IconComponent } from '../../../shared/ui/icon.component';

type Tab = 'entrar' | 'cadastro';
const MESSAGES: Record<string, string> = {
  required: 'Campo obrigatório', email: 'E-mail inválido', minlength: 'Mínimo de 8 caracteres', mismatch: 'As senhas não conferem',
};

const sameAsPassword = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };

/** Login e cadastro na mesma página. Desktop: lado a lado; mobile: abas (?aba=cadastro). */
@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, IconComponent],
  template: `
    <div class="container wrap">
      <section class="card" [class.hide]="tab() !== 'entrar'" aria-labelledby="t-login">
        <div class="tabs" role="tablist">
          <button type="button" role="tab" class="on" aria-selected="true">Entrar</button>
          <button type="button" role="tab" aria-selected="false" (click)="go('cadastro')">Criar conta</button>
        </div>
        <h1 id="t-login">Que bom te ver de novo</h1>
        <p class="sub">Entre para acompanhar pedidos e comprar mais rápido.</p>
        <form [formGroup]="login" (ngSubmit)="submitLogin()" novalidate>
          @if (loginError()) { <p class="alert error" role="alert">{{ loginError() }}</p> }
          <div class="field"><label for="l-email">E-mail</label>
            <input id="l-email" type="email" formControlName="email" autocomplete="email" placeholder="voce@email.com" />
            @if (err(login, 'email'); as m) { <span class="error">{{ m }}</span> }</div>
          <div class="field"><label for="l-pass">Senha</label>
            <input id="l-pass" type="password" formControlName="password" autocomplete="current-password" placeholder="••••••••" />
            @if (err(login, 'password'); as m) { <span class="error">{{ m }}</span> }</div>
          <div class="between">
            <label class="check"><input type="checkbox" formControlName="remember" /> Manter conectado</label>
            <a href="#" class="forgot" (click)="$event.preventDefault()">Esqueci a senha</a>
          </div>
          <button uiButton variant="cta" size="lg" [block]="true" type="submit" [disabled]="busy()">{{ busy() ? 'Entrando…' : 'Entrar' }}</button>
          <p class="note"><ui-icon name="lock" [size]="14" /> Seus dados ficam protegidos</p>
        </form>
      </section>

      <section class="card" [class.hide]="tab() !== 'cadastro'" aria-labelledby="t-reg">
        <div class="tabs" role="tablist">
          <button type="button" role="tab" aria-selected="false" (click)="go('entrar')">Entrar</button>
          <button type="button" role="tab" class="on" aria-selected="true">Criar conta</button>
        </div>
        <h1 id="t-reg">Crie sua conta</h1>
        <p class="sub">Leva menos de um minuto.</p>
        <form [formGroup]="register" (ngSubmit)="submitRegister()" novalidate>
          @if (registerError()) { <p class="alert error" role="alert">{{ registerError() }}</p> }
          <div class="field"><label for="r-name">Nome completo</label>
            <input id="r-name" formControlName="name" autocomplete="name" placeholder="João Pedro" />
            @if (err(register, 'name'); as m) { <span class="error">{{ m }}</span> }</div>
          <div class="field"><label for="r-email">E-mail</label>
            <input id="r-email" type="email" formControlName="email" autocomplete="email" placeholder="voce@email.com" />
            @if (err(register, 'email'); as m) { <span class="error">{{ m }}</span> }</div>
          <div class="two">
            <div class="field"><label for="r-pass">Senha</label>
              <input id="r-pass" type="password" formControlName="password" autocomplete="new-password" placeholder="••••••••" />
              @if (err(register, 'password'); as m) { <span class="error">{{ m }}</span> }</div>
            <div class="field"><label for="r-conf">Confirmar senha</label>
              <input id="r-conf" type="password" formControlName="confirm" autocomplete="new-password" placeholder="••••••••" />
              @if (register.controls['confirm'].touched && register.errors?.['mismatch']) { <span class="error">{{ msg('mismatch') }}</span> }</div>
          </div>
          <button uiButton variant="cta" size="lg" [block]="true" type="submit" [disabled]="busy()">{{ busy() ? 'Criando…' : 'Criar conta' }}</button>
          <p class="note">Mínimo de 8 caracteres na senha</p>
        </form>
      </section>
    </div>`,
  styles: [`
    .wrap { display: flex; justify-content: center; align-items: flex-start; gap: 24px; padding: 56px 0 72px; }
    .card { width: 440px; padding: 32px; } .hide { display: none; }
    .tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 3px; margin-bottom: 20px; background: #ececec; border-radius: 8px; }
    .tabs button { height: 34px; border: 0; border-radius: 6px; background: none; color: var(--muted); font-weight: 500; } .tabs .on { background: #fff; color: var(--ink); font-weight: 600; box-shadow: var(--shadow); }
    h1 { font-size: 24px; font-weight: 700; } .sub { margin: 4px 0 18px; color: var(--ink2); }
    form { display: grid; gap: 14px; } .two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .between { display: flex; justify-content: space-between; align-items: center; } .check { display: flex; align-items: center; gap: 8px; color: var(--ink2); cursor: pointer; }
    .forgot { font-weight: 600; } .note { display: flex; justify-content: center; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
    @media (min-width: 861px) { .hide { display: block; } .tabs button { cursor: pointer; } }
    @media (max-width: 480px) { .card { padding: 20px; } .two { grid-template-columns: 1fr; } }
  `],
})
export class AuthPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AuthApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly tab = computed<Tab>(() => (this.query().get('aba') === 'cadastro' ? 'cadastro' : 'entrar'));
  protected readonly busy = signal(false);
  protected readonly loginError = signal('');
  protected readonly registerError = signal('');

  protected readonly login = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false], // MVP: visual. O token sempre vai para o localStorage
  });

  protected readonly register = this.fb.group(
    { name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]], confirm: ['', Validators.required] },
    { validators: sameAsPassword },
  );

  protected go(aba: Tab): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { aba: aba === 'cadastro' ? aba : null }, queryParamsHandling: 'merge' });
  }

  protected msg(code: string): string { return MESSAGES[code] ?? 'Valor inválido'; }

  protected err(form: FormGroup, name: string): string {
    const c = form.controls[name];
    if (!c || !c.touched || !c.errors) return '';
    const server = c.errors['server'];
    return server ?? this.msg(Object.keys(c.errors)[0]);
  }

  protected submitLogin(): void {
    this.loginError.set('');
    if (this.login.invalid) return this.login.markAllAsTouched();
    const { email, password } = this.login.getRawValue();
    this.busy.set(true);
    this.api.login({ email, password }).subscribe({
      next: (res) => this.done(res),
      error: (e: HttpErrorResponse) => this.fail(e, this.login, this.loginError, 'E-mail ou senha inválidos'),
    });
  }

  protected submitRegister(): void {
    this.registerError.set('');
    if (this.register.invalid) return this.register.markAllAsTouched();
    const { name, email, password } = this.register.getRawValue();
    this.busy.set(true);
    this.api.register({ name, email, password }).subscribe({
      next: (res) => this.done(res),
      error: (e: HttpErrorResponse) => this.fail(e, this.register, this.registerError, 'Não foi possível criar a conta'),
    });
  }

  private done(res: AuthResponse): void {
    this.store.login(res);
    const back = this.route.snapshot.queryParamMap.get('returnUrl');
    // só aceita caminho interno (evita open redirect via ?returnUrl=//site-malicioso)
    this.router.navigateByUrl(back && back.startsWith('/') && !back.startsWith('//') ? back : '/catalogo');
  }

  private fail(e: HttpErrorResponse, form: FormGroup, target: ReturnType<typeof signal<string>>, fallback: string): void {
    this.busy.set(false);
    const api = e.error as Partial<ApiError> | null;
    api?.fields?.forEach((f) => form.controls[f.field]?.setErrors({ server: f.message }));
    form.markAllAsTouched();
    target.set(e.status === 0 ? 'Sem conexão com o servidor. Tente de novo.' : e.status >= 500 ? 'Algo deu errado do nosso lado. Tente de novo.' : (api?.message ?? fallback));
  }
}
