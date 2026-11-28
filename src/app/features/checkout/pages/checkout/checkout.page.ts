import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '../../../../core/auth/services/auth.api';
import { CartStore } from '../../../cart/services/cart.store';
import { OrdersApi } from '../../../orders/services/orders.api';
import { ApiError } from '../../../../shared/models/api-error';
import { PaymentMethod } from '../../../../shared/models/order';
import { CheckoutStepsComponent } from '../../components/checkout-steps/checkout-steps.component';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { PaymentOptionsComponent } from '../../components/payment-options/payment-options.component';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, CheckoutStepsComponent, OrderSummaryComponent, PaymentOptionsComponent],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
})
export class CheckoutPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cart = inject(CartStore);
  private readonly orders = inject(OrdersApi);
  private readonly router = inject(Router);

  protected readonly ufs = UFS;
  protected readonly payment = signal<PaymentMethod>('PIX');
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.group({
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    street: ['', Validators.required], number: ['', Validators.required], complement: [''],
    district: ['', Validators.required], city: ['', Validators.required], state: ['SP', Validators.required],
  });

  constructor() {
    if (this.cart.items().length === 0) this.router.navigate(['/carrinho']);
    // pré-preenche com o endereço do cadastro (GET /users/me), se existir
    inject(AuthApi).me().subscribe({ next: (u) => u.address && this.form.patchValue(u.address), error: () => undefined });
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

  protected confirm(): void {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error.set('Confira os campos de endereço.'); return; }
    if (this.busy()) return; // evita pedido duplicado
    this.busy.set(true);
    this.orders.create({
      items: this.cart.items().map((i) => ({ productId: i.productId, quantity: i.quantity })),
      address: this.form.getRawValue(),
      paymentMethod: this.payment(),
    }).subscribe({
      next: () => { this.cart.clear(); this.router.navigate(['/pedidos']); },
      error: (e: HttpErrorResponse) => this.fail(e, this.form),
    });
  }

  private fail(e: HttpErrorResponse, form: FormGroup): void {
    this.busy.set(false);
    const api = e.error as Partial<ApiError> | null;
    api?.fields?.forEach((f) => form.get(f.field.split('.').pop()!)?.setErrors({ server: f.message }));
    // 409/422 (ex.: estoque): mostra a mensagem do back e mantém o carrinho
    this.error.set(e.status === 0 ? 'Sem conexão com o servidor. Tente de novo.' : e.status >= 500 ? 'Algo deu errado do nosso lado. Tente de novo.' : (api?.message ?? 'Não foi possível confirmar o pedido.'));
  }
}
