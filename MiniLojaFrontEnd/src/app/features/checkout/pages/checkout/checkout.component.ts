import { CheckoutFacade } from '../../facades/checkout.facade';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethod } from '@shared/models/order';
import { CheckoutStepsComponent } from '../../components/checkout-steps/checkout-steps.component';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { PaymentOptionsComponent } from '../../components/payment-options/payment-options.component';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, CheckoutStepsComponent, OrderSummaryComponent, PaymentOptionsComponent],
  providers: [CheckoutFacade],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly checkout = inject(CheckoutFacade);

  protected readonly ufs = UFS;
  protected readonly payment = signal<PaymentMethod>('PIX');
  protected readonly busy = this.checkout.busy;
  protected readonly error = this.checkout.error;

  protected readonly form = this.fb.group({
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    street: ['', Validators.required], number: ['', Validators.required], complement: [''],
    district: ['', Validators.required], city: ['', Validators.required], state: ['SP', Validators.required],
  });

  constructor() {
    this.checkout.redirectIfCartEmpty();
    // pré-preenche com o endereço do cadastro, se existir
    void this.checkout.savedAddress().then((a) => a && this.form.patchValue(a));
  }

  protected maskCep(e: Event): void {
    const el = e.target as HTMLInputElement;
    const d = el.value.replace(/\D/g, '').slice(0, 8);
    this.form.controls.cep.setValue(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d);
  }

  protected invalid(name: string): boolean { const c = this.form.get(name); return !!c && c.touched && c.invalid; }
  protected message(name: string): string {
    const e = this.form.get(name)?.errors ?? {};
    return e['server'] ?? (e['pattern'] ? 'CEP inválido' : 'Campo obrigatório');
  }

  protected async confirm(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error.set('Confira os campos de endereço.'); return; }
    const fail = await this.checkout.confirm(this.form.getRawValue(), this.payment());
    fail?.fields.forEach((f) => this.form.get(f.field.split('.').pop()!)?.setErrors({ server: f.message }));
  }
}
