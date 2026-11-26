import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartStore } from '../../../core/cart/cart.store';
import { StoreInfoStore } from '../../../core/store-info/store-info.store';
import { Product } from '../../../shared/models/product';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { PriceBlockComponent } from '../../../shared/ui/price-block.component';

/** Caixa de compra: preço, frete, estoque, quantidade, Comprar agora e Adicionar ao carrinho. */
@Component({
  selector: 'app-buy-box',
  standalone: true,
  imports: [BrlPipe, ButtonComponent, IconComponent, PriceBlockComponent],
  template: `
    <div class="card box">
      <span class="cat">{{ product().category.name }}</span>
      <h1>{{ product().name }}</h1>
      <ui-price-block size="detail" [price]="product().price" [originalPrice]="product().originalPrice" [maxInstallments]="info().maxInstallments" />
      <button type="button" class="link pay">Ver meios de pagamento</button>
      <hr />
      <p class="ship"><ui-icon name="truck" [size]="18" /> <span><span><b class="ok">Frete grátis</b> acima de {{ info().freeShippingThreshold | brl: 0 }}</span><small>Frete fixo de {{ info().shippingFee | brl }} nas demais compras.</small></span></p>
      <form class="cep" (submit)="$event.preventDefault(); cepClicked.set(true)">
        <input class="input" placeholder="CEP 00000-000" aria-label="CEP" inputmode="numeric" maxlength="9" />
        <button uiButton variant="outline" type="submit">Calcular</button>
      </form>
      @if (cepClicked()) { <p class="hint">O cálculo por CEP chega na v2. Por enquanto vale a regra acima.</p> }
      <p class="stock">
        @if (product().stock > 0) { <b>Estoque disponível</b> · {{ product().stock }} unidades } @else { <b class="warn">Sem estoque no momento</b> }
      </p>
      @if (product().stock > 0) {
        <div class="qty"><span>Quantidade</span>
          <div class="stepper">
            <button type="button" aria-label="Diminuir" [disabled]="qty() <= 1" (click)="qty.set(qty() - 1)"><ui-icon name="minus" [size]="12" /></button>
            <output aria-live="polite">{{ qty() }}</output>
            <button type="button" aria-label="Aumentar" [disabled]="qty() >= product().stock" (click)="qty.set(qty() + 1)"><ui-icon name="plus" [size]="12" /></button>
          </div>
        </div>
      }
      <button uiButton variant="cta" size="lg" [block]="true" [disabled]="product().stock === 0" (click)="buyNow()">Comprar agora</button>
      <button uiButton variant="outline" size="lg" [block]="true" [disabled]="product().stock === 0" (click)="addToCart()">{{ added() ? 'Adicionado ✓' : 'Adicionar ao carrinho' }}</button>
      <p class="trust"><ui-icon name="return" [size]="14" /> Devolução grátis em até {{ info().returnDays }} dias</p>
      <p class="trust"><ui-icon name="lock" [size]="14" /> Compra segura, dados protegidos</p>
    </div>`,
  styles: [`
    .box { display: grid; gap: 12px; padding: 24px; }
    .cat { font-size: 12px; color: var(--muted); } h1 { font-size: 24px; font-weight: 600; line-height: 1.25; }
    .pay { justify-self: start; } hr { border: 0; border-top: 1px solid var(--line); margin: 4px 0; width: 100%; }
    .ship { display: flex; gap: 8px; color: var(--ok); } .ship span { display: grid; color: var(--ink); } .ship small { color: var(--muted); font-size: 12px; margin-top: 2px; }
    .ok { color: var(--ok); } .warn { color: var(--warn); }
    .cep { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
    .hint { font-size: 12px; color: var(--muted); } .stock { font-size: 13px; color: var(--muted); } .stock b { color: var(--ink); }
    .qty { display: flex; align-items: center; gap: 14px; color: var(--muted); }
    .stepper { display: inline-flex; align-items: center; border: 1px solid #cfcfcf; border-radius: var(--radius); }
    .stepper button { width: 36px; height: 38px; display: grid; place-items: center; background: none; border: 0; color: var(--brand); } .stepper button:disabled { opacity: .35; }
    .stepper output { min-width: 40px; text-align: center; color: var(--ink); font-weight: 500; }
    .trust { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
  `],
})
export class BuyBoxComponent {
  readonly product = input.required<Product>();
  private readonly cart = inject(CartStore);
  private readonly router = inject(Router);
  protected readonly info = inject(StoreInfoStore).info;
  protected readonly qty = signal(1);
  protected readonly added = signal(false);
  protected readonly cepClicked = signal(false);
  protected readonly maxQty = computed(() => this.product().stock);

  protected addToCart(): void {
    this.cart.add(this.product(), this.qty());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1400);
  }

  protected buyNow(): void {
    this.cart.add(this.product(), this.qty());
    this.router.navigate(['/checkout']);
  }
}
