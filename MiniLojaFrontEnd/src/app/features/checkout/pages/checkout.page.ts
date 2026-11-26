import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth.api';
import { CartStore } from '../../../core/cart/cart.store';
import { OrdersApi } from '../../../core/orders/orders.api';
import { ApiError } from '../../../shared/models/api-error';
import { PaymentMethod } from '../../../shared/models/order';
import { CheckoutStepsComponent } from '../components/checkout-steps.component';
import { OrderSummaryComponent } from '../components/order-summary.component';
import { PaymentOptionsComponent } from '../components/payment-options.component';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, CheckoutStepsComponent, OrderSummaryComponent, PaymentOptionsComponent],
  template: `
    <div class="container page">
      <app-checkout-steps />
      <div class="cols">
        <div class="left">
          @if (error()) { <p class="alert error" role="alert">{{ error() }}</p> }
          <section class="card">
            <h1>Endereço de entrega</h1>
            <form [formGroup]="form" class="grid" novalidate>
              <div class="field cep"><label for="cep">CEP</label>
                <input id="cep" formControlName="cep" inputmode="numeric" maxlength="9" autocomplete="postal-code" placeholder="00000-000" (input)="maskCep($event)" />
                @if (invalid('cep')) { <span class="error">{{ message('cep') }}</span> }</div>
              <div class="field street"><label for="street">Rua</label>
                <input id="street" formControlName="street" autocomplete="address-line1" placeholder="Rua Exemplo" />
                @if (invalid('street')) { <span class="error">{{ message('street') }}</span> }</div>
              <div class="field num"><label for="number">Número</label>
                <input id="number" formControlName="number" placeholder="123" />
                @if (invalid('number')) { <span class="error">{{ message('number') }}</span> }</div>
              <div class="field comp"><label for="complement">Complemento</label>
                <input id="complement" formControlName="complement" autocomplete="address-line2" placeholder="Apto 4" /></div>
              <div class="field dist"><label for="district">Bairro</label>
                <input id="district" formControlName="district" placeholder="Centro" />
                @if (invalid('district')) { <span class="error">{{ message('district') }}</span> }</div>
              <div class="field city"><label for="city">Cidade</label>
                <input id="city" formControlName="city" autocomplete="address-level2" placeholder="Maracaí" />
                @if (invalid('city')) { <span class="error">{{ message('city') }}</span> }</div>
              <div class="field uf"><label for="state">UF</label>
                <select id="state" formControlName="state">@for (u of ufs; track u) { <option [value]="u">{{ u }}</option> }</select></div>
            </form>
          </section>
          <section class="card">
            <h2>Forma de pagamento <span class="chip">simulado no MVP</span></h2>
            <app-payment-options [value]="payment()" (valueChange)="payment.set($event)" />
          </section>
        </div>
        <app-order-summary [busy]="busy()" (confirm)="confirm()" />
      </div>
    </div>`,
  styles: [`
    .page { gap: 24px; } .cols { display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 24px; align-items: start; } .left { display: grid; gap: 20px; }
    section { padding: 28px; } h1, h2 { font-size: 22px; font-weight: 600; margin-bottom: 14px; } h2 { display: flex; align-items: center; gap: 10px; }
    .chip { padding: 3px 10px; border-radius: 999px; background: #ececec; font-size: 11px; font-weight: 500; color: var(--ink2); }
    .grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px 16px; }
    .cep { grid-column: span 2; } .street { grid-column: span 4; } .num { grid-column: span 2; } .comp { grid-column: span 2; } .dist { grid-column: span 2; } .city { grid-column: span 5; } .uf { grid-column: span 1; }
    @media (max-width: 960px) { .cols { grid-template-columns: 1fr; } }
    @media (max-width: 560px) { .grid > * { grid-column: 1 / -1 !important; } }
  `],
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
