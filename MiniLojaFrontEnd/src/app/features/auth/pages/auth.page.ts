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
  templateUrl: './auth.page.html',
  styleUrl: './auth.page.scss',
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
