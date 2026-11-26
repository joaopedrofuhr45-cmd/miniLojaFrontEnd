import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { ProductCardComponent } from '../../../shared/ui/product-card.component';

/** Vitrine: título + "Ver todas" + 4 cards. `products = null` mostra o esqueleto de carregamento. */
@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <div class="head"><h2 class="section-title">{{ title() }}</h2><a routerLink="/catalogo" [queryParams]="query()">Ver todas ›</a></div>
    <div class="grid">
      @if (products(); as list) {
        @for (p of list; track p.id) { <ui-product-card [product]="p" (add)="add.emit($event)" /> }
      } @else {
        @for (i of [1, 2, 3, 4]; track i) { <div class="skeleton" style="height:390px"></div> }
      }
    </div>`,
  styles: [`
    :host { display: grid; gap: 12px; }
    .head { display: flex; justify-content: space-between; align-items: baseline; } .head a { font-size: 13px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    @media (max-width: 960px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `],
})
export class ProductShowcaseComponent {
  readonly title = input.required<string>();
  readonly products = input.required<Product[] | null>();
  readonly query = input<Record<string, string | number>>({});
  readonly add = output<Product>();
}
