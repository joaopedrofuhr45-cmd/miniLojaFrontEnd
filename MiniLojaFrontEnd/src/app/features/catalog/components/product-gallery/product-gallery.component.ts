import { Component, computed, input, signal } from '@angular/core';
import { Product } from '../../../../shared/models/product';
import { discountPct } from '../../../../shared/utils/price';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ProductThumbComponent } from '../../../../shared/ui/product-thumb/product-thumb.component';

/** Miniaturas + imagem grande. Sem imageUrl, mostra 4 placeholders coloridos (só o MVP do Figma). */
@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [IconComponent, ProductThumbComponent],
  templateUrl: './product-gallery.component.html',
  styleUrl: './product-gallery.component.scss',
})
export class ProductGalleryComponent {
  readonly product = input.required<Product>();
  protected readonly selected = signal(0);
  protected readonly fav = signal(false);
  protected readonly seeds = computed(() => [0, 1, 2, 3].map((n) => this.product().id + n));
  protected readonly off = computed(() => discountPct(this.product().price, this.product().originalPrice));
}
