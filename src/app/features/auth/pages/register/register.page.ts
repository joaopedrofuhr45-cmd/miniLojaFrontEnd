import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../../core/auth/services/auth.api';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { SwapComponent } from '../../../../shared/ui/swap/swap.component';
import { applyServerError, authMessage, fieldError, safeReturnUrl } from '../../auth-form';

const sameAsPassword = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };

/** Tela de cadastro (/cadastrar). O link "Entrar" leva para /entrar mantendo o returnUrl. */
@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, SwapComponent],
  templateUrl: './register.page.html',
  styleUrls: ['../../auth-form.scss', './register.page.scss'],
})
export class RegisterPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AuthApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.group(
    { name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]], confirm: ['', Validators.required] },
    { validators: sameAsPassword },
  );

  protected readonly mismatch = authMessage('mismatch');

  protected err(name: string): string { return fieldError(this.form, name); }

  protected submit(): void {
    this.error.set('');
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { name, email, password } = this.form.getRawValue();
    this.busy.set(true);
    this.api.register({ name, email, password }).subscribe({
      next: (res) => {
        this.store.login(res);
        this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
      },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(applyServerError(e, this.form, 'Não foi possível criar a conta'));
      },
    });
  }
}
