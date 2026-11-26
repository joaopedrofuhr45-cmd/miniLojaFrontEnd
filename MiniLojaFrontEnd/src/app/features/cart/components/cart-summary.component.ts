import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { CartStore } from '../../../core/cart/cart.store';
import { StoreInfoStore } from '../../../core/store-info/store-info.store';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { installments } from '../../../shared/utils/price';

/** Barra de frete grátis + resumo. Os valores são só de exibição: o back recalcula no pedido. */
@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [BrlPipe, ButtonComponent],
  template: `
    <div class="ship" [class.done]="cart.missingForFreeShipping() === 0">
      <b>{{ cart.missingForFreeShipping() === 0 ? 'Você ganhou frete grátis!' : 'Faltam ' + (cart.missingForFreeShipping() | brl) + ' para o frete grátis' }}</b>
      <div class="bar" role="progressbar" [attr.aria-valuenow]="cart.freeShippingProgress()" aria-valuemin="0" aria-valuemax="100"><span [style.width.%]="cart.freeShippingProgress()"></span></div>
    </div>
    <div class="card box">
      <h2>Resumo da compra</h2>
      <p class="row"><span>Produtos ({{ cart.count() }})</span><span>{{ cart.subtotal() | brl }}</span></p>
      <p class="row"><span>Frete</span>@if (cart.shipping() === 0) { <b class="free">Grátis</b> } @else { <span>{{ cart.shipping() | brl }}</span> }</p>
      <p class="row total"><b>Total</b><b>{{ cart.total() | brl }}</b></p>
      @if (parcels() > 1) { <p class="inst">ou em {{ parcels() }}x {{ cart.total() / parcels() | brl }} sem juros</p> }
      <button uiButton variant="cta" size="lg" [block]="true" (click)="next()">Continuar a compra</button>
      <p class="note">Você faz login na próxima etapa, se precisar</p>
    </div>`,
  styles: [`
    :host { display: grid; gap: 12px; align-content: start; }
    .ship { padding: 12px 16px; border: 1px solid #bfe3cd; border-radius: var(--radius); background: var(--ok-soft); color: var(--ok); display: grid; gap: 8px; }
    .bar { height: 5px; border-radius: 3px; background: #c8e8d4; overflow: hidden; } .bar span { display: block; height: 100%; background: var(--ok); transition: width .3s; }
    .box { display: grid; gap: 10px; padding: 24px; } h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
    .row { display: flex; justify-content: space-between; color: var(--ink2); } .free { color: var(--ok); }
    .total { align-items: baseline; padding-top: 12px; border-top: 1px solid var(--line); color: var(--ink); } .total b:first-child { font-size: 20px; } .total b:last-child { font-size: 28px; }
    .inst { justify-self: end; font-size: 12px; color: var(--ok); } .note { text-align: center; font-size: 12px; color: var(--muted); }
  `],
})
export class CartSummaryComponent {
  protected readonly cart = inject(CartStore);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly info = inject(StoreInfoStore).info;
  protected readonly parcels = computed(() => installments(this.cart.total(), this.info().maxInstallments));

  protected next(): void {
    if (this.auth.isLoggedIn()) this.router.navigate(['/checkout']);
    else this.router.navigate(['/entrar'], { queryParams: { returnUrl: '/checkout' } });
  }
}
