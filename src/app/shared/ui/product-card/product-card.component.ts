import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product';
import { discountPct } from '../../utils/price';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { PriceBlockComponent } from '../price-block/price-block.component';
import { ProductThumbComponent } from '../product-thumb/product-thumb.component';

/** Card denso: dá pra decidir a compra sem abrir o produto. Não conhece o carrinho: só emite (add). */
@Component({
  selector: 'ui-product-card',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent, PriceBlockComponent, ProductThumbComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
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
