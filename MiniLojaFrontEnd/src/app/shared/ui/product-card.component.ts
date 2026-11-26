import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models/product';
import { discountPct } from '../utils/price';
import { ButtonComponent } from './button.component';
import { IconComponent } from './icon.component';
import { PriceBlockComponent } from './price-block.component';
import { ProductThumbComponent } from './product-thumb.component';

/** Card denso: dá pra decidir a compra sem abrir o produto. Não conhece o carrinho: só emite (add). */
@Component({
  selector: 'ui-product-card',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent, PriceBlockComponent, ProductThumbComponent],
  template: `
    <article class="card">
      <a class="media" [routerLink]="['/produtos', product().id]" [attr.aria-label]="product().name">
        <ui-product-thumb [seed]="product().id" [imageUrl]="product().imageUrl" [alt]="product().name" />
      </a>
      @if (off()) { <span class="tag">{{ off() }}% OFF</span> }
      <button class="fav" type="button" aria-label="Favoritar" [attr.aria-pressed]="fav()" (click)="fav.set(!fav())">
        <ui-icon name="heart" [size]="16" [filled]="fav()" />
      </button>
      <div class="body">
        <a class="title" [routerLink]="['/produtos', product().id]">{{ product().name }}</a>
        <ui-price-block [price]="product().price" [originalPrice]="product().originalPrice" />
        <span class="cat">{{ product().category.name }}</span>
        <button uiButton variant="outline" size="sm" [block]="true" [disabled]="product().stock === 0" (click)="onAdd()">
          {{ product().stock === 0 ? 'Sem estoque' : added() ? 'Adicionado ✓' : 'Adicionar ao carrinho' }}
        </button>
      </div>
    </article>`,
  styles: [`
    :host { display: block; }
    article { position: relative; height: 100%; overflow: hidden; display: flex; flex-direction: column; }
    .media { display: block; aspect-ratio: 1.3; }
    .tag { position: absolute; top: 8px; left: 8px; padding: 2px 6px; border-radius: 3px; background: var(--ok); color: #fff; font-size: 11px; font-weight: 700; }
    .fav { position: absolute; top: 8px; right: 8px; display: grid; place-items: center; width: 28px; height: 28px; border: 0; border-radius: 50%; background: #fff; color: var(--ink); }
    .fav[aria-pressed='true'] { color: var(--cta); }
    .body { display: flex; flex: 1; flex-direction: column; gap: 6px; padding: 12px; }
    .title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8em; color: var(--ink); font-size: 14px; }
    .cat { font-size: 12px; color: var(--muted); }
    button[uiButton] { margin-top: auto; }
  `],
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly add = output<Product>();
  protected readonly fav = signal(false); // favoritos: só visual no MVP
  protected readonly added = signal(false);
  protected readonly off = computed(() => discountPct(this.product().price, this.product().originalPrice));

  protected onAdd(): void {
    this.add.emit(this.product());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1400);
  }
}
