import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../../core/cart/cart.store';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { CartItemRowComponent } from '../components/cart-item-row.component';
import { CartSummaryComponent } from '../components/cart-summary.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, IconComponent, CartItemRowComponent, CartSummaryComponent],
  template: `
    <div class="container page">
      <nav class="breadcrumb" aria-label="Você está aqui"><a routerLink="/">Início</a><span aria-current="page">Carrinho</span></nav>
      @if (cart.items().length === 0) {
        <div class="card"><ui-empty-state icon="cart" title="Seu carrinho está vazio" message="Adicione produtos do catálogo para continuar.">
          <a uiButton variant="cta" routerLink="/catalogo">Ver catálogo</a></ui-empty-state></div>
      } @else {
        <div class="cols">
          <div>
            <section class="card list">
              <header><h1>Carrinho <small>({{ cart.count() }} {{ cart.count() === 1 ? 'item' : 'itens' }})</small></h1><button type="button" class="link" (click)="cart.clear()">Esvaziar carrinho</button></header>
              @for (i of cart.items(); track i.productId) {
                <app-cart-item-row [item]="i" (remove)="cart.remove(i.productId)" (quantityChange)="cart.setQuantity(i.productId, $event)" />
              }
            </section>
            <a class="back" routerLink="/catalogo"><ui-icon name="arrow-left" [size]="16" /> Continuar comprando</a>
          </div>
          <app-cart-summary />
        </div>
      }
    </div>`,
  styles: [`
    .cols { display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 24px; align-items: start; }
    .list { padding: 24px; } header { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 500; } h1 small { font-size: 14px; color: var(--muted); }
    .back { display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; font-weight: 600; }
    @media (max-width: 960px) { .cols { grid-template-columns: 1fr; } }
  `],
})
export class CartPage {
  protected readonly cart = inject(CartStore);
}
