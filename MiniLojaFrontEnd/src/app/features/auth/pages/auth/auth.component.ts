import { ServerError } from '@shared/utils/server-error';
import { AuthFlowFacade } from '../../facades/auth-flow.facade';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

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
  providers: [AuthFlowFacade],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly flow = inject(AuthFlowFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly tab = computed<Tab>(() => (this.query().get('aba') === 'cadastro' ? 'cadastro' : 'entrar'));
  protected readonly busy = this.flow.busy;
  protected readonly loginError = this.flow.loginError;
  protected readonly registerError = this.flow.registerError;

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

  protected async submitLogin(): Promise<void> {
    this.loginError.set('');
    if (this.login.invalid) return this.login.markAllAsTouched();
    const { email, password } = this.login.getRawValue();
    this.showServerErrors(this.login, await this.flow.login(email, password));
  }

  protected async submitRegister(): Promise<void> {
    this.registerError.set('');
    if (this.register.invalid) return this.register.markAllAsTouched();
    const { name, email, password } = this.register.getRawValue();
    this.showServerErrors(this.register, await this.flow.register(name, email, password));
  }

  private showServerErrors(form: FormGroup, error: ServerError | null): void {
    if (!error) return;
    error.fields.forEach((f) => form.controls[f.field]?.setErrors({ server: f.message }));
    form.markAllAsTouched();
  }
}
