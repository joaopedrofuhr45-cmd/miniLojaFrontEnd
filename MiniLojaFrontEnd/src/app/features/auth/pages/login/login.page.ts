import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../../core/auth/services/auth.api';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { applyServerError, fieldError, safeReturnUrl } from '../../auth-form';

/** Tela de login (/entrar). O link "Criar conta" leva para /cadastrar mantendo o returnUrl. */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, IconComponent],
  templateUrl: './login.page.html',
  styleUrls: ['../../auth-form.scss', './login.page.scss'],
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AuthApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false], // MVP: visual. O token sempre vai para o localStorage
  });

  protected err(name: string): string { return fieldError(this.form, name); }

  protected submit(): void {
    this.error.set('');
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { email, password } = this.form.getRawValue();
    this.busy.set(true);
    this.api.login({ email, password }).subscribe({
      next: (res) => {
        this.store.login(res);
        this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(applyServerError(e, this.form, 'E-mail ou senha inválidos'));
      },
    });
  }
}
