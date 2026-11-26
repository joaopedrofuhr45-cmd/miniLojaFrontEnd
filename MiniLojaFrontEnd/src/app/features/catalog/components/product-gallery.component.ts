import { Component, computed, input, signal } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { discountPct } from '../../../shared/utils/price';
import { IconComponent } from '../../../shared/ui/icon.component';
import { ProductThumbComponent } from '../../../shared/ui/product-thumb.component';

/** Miniaturas + imagem grande. Sem imageUrl, mostra 4 placeholders coloridos (só o MVP do Figma). */
@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [IconComponent, ProductThumbComponent],
  template: `
    @if (!product().imageUrl) {
      <div class="thumbs" role="tablist" aria-label="Imagens do produto">
        @for (seed of seeds(); track seed; let i = $index) {
          <button type="button" role="tab" [class.on]="i === selected()" [attr.aria-selected]="i === selected()" (click)="selected.set(i)">
            <ui-product-thumb [seed]="seed" [iconSize]="22" />
          </button>
        }
      </div>
    }
    <div class="main">
      <ui-product-thumb [seed]="seeds()[selected()]" [imageUrl]="product().imageUrl" [alt]="product().name" [iconSize]="150" />
      @if (off()) { <span class="tag">{{ off() }}% OFF</span> }
      <button type="button" class="fav" aria-label="Favoritar" [attr.aria-pressed]="fav()" (click)="fav.set(!fav())"><ui-icon name="heart" [size]="18" [filled]="fav()" /></button>
    </div>`,
  styles: [`
    :host { display: flex; gap: 20px; }
    .thumbs { display: grid; gap: 12px; align-content: start; }
    .thumbs button { width: 60px; height: 60px; padding: 0; border: 2px solid transparent; border-radius: 4px; overflow: hidden; background: none; }
    .thumbs button.on { border-color: var(--brand); }
    .main { position: relative; flex: 1; aspect-ratio: 1.49; min-height: 280px; border-radius: 4px; overflow: hidden; }
    .tag { position: absolute; top: 10px; left: 10px; padding: 2px 8px; border-radius: 3px; background: var(--ok); color: #fff; font-size: 11px; font-weight: 700; }
    .fav { position: absolute; top: 10px; right: 10px; display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 50%; background: #fff; }
    .fav[aria-pressed='true'] { color: var(--cta); }
    @media (max-width: 600px) { :host { flex-direction: column-reverse; } .thumbs { grid-auto-flow: column; } }
  `],
})
export class ProductGalleryComponent {
  readonly product = input.required<Product>();
  protected readonly selected = signal(0);
  protected readonly fav = signal(false);
  protected readonly seeds = computed(() => [0, 1, 2, 3].map((n) => this.product().id + n));
  protected readonly off = computed(() => discountPct(this.product().price, this.product().originalPrice));
}
