import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../../core/cart/cart.store';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { ProductThumbComponent } from '../../../shared/ui/product-thumb.component';

/** Resumo do pedido. O total é só de exibição: o back recalcula preço e estoque no POST /orders. */
@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [RouterLink, BrlPipe, ButtonComponent, IconComponent, ProductThumbComponent],
  template: `
    <div class="card box">
      <h2>Resumo do pedido</h2>
      <ul>
        @for (i of cart.items(); track i.productId) {
          <li>
            <span class="thumb"><ui-product-thumb [seed]="i.productId" [imageUrl]="i.imageUrl" [iconSize]="22" /></span>
            <span class="name"><b>{{ short(i.name) }}</b><small>Qtd {{ i.quantity }}</small></span>
            <b>{{ i.price * i.quantity | brl }}</b>
          </li>
        }
      </ul>
      <p class="row"><span>Produtos</span><span>{{ cart.subtotal() | brl }}</span></p>
      <p class="row"><span>Frete</span>@if (cart.shipping() === 0) { <b class="free">Grátis</b> } @else { <span>{{ cart.shipping() | brl }}</span> }</p>
      <p class="row total"><b>Total</b><b>{{ cart.total() | brl }}</b></p>
      <button uiButton variant="cta" size="lg" [block]="true" type="button" [disabled]="busy()" (click)="confirm.emit()">{{ busy() ? 'Confirmando…' : 'Confirmar pedido' }}</button>
      <p class="trust"><ui-icon name="lock" [size]="14" /> Pagamento seguro</p>
      <p class="trust"><ui-icon name="return" [size]="14" /> Troca em até 7 dias</p>
    </div>
    <a class="back" routerLink="/carrinho"><ui-icon name="arrow-left" [size]="14" /> Voltar ao carrinho</a>`,
  styles: [`
    :host { display: grid; gap: 14px; justify-items: center; align-content: start; } .box { display: grid; gap: 10px; padding: 24px; width: 100%; }
    h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; } ul { display: grid; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
    li { display: flex; align-items: center; gap: 12px; } .thumb { width: 50px; height: 50px; border-radius: 4px; overflow: hidden; flex: none; }
    .name { flex: 1; display: grid; } .name small { color: var(--muted); font-size: 12px; }
    .row { display: flex; justify-content: space-between; color: var(--ink2); } .free { color: var(--ok); }
    .total { align-items: baseline; padding-top: 12px; border-top: 1px solid var(--line); color: var(--ink); } .total b:first-child { font-size: 20px; } .total b:last-child { font-size: 26px; }
    .trust { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); } .back { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; font-size: 13px; }
  `],
})
export class OrderSummaryComponent {
  protected readonly cart = inject(CartStore);
  readonly busy = input(false);
  readonly confirm = output<void>();
  protected short(name: string): string { return name.split(' · ')[0]; }
}
