import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { ProductCardComponent } from '../../../shared/ui/product-card.component';

/** Vitrine: título + "Ver todas" + 4 cards. `products = null` mostra o esqueleto de carregamento. */
@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './product-showcase.component.html',
  styleUrl: './product-showcase.component.scss',
})
export class ProductShowcaseComponent {
  readonly title = input.required<string>();
  readonly products = input.required<Product[] | null>();
  readonly query = input<Record<string, string | number>>({});
  readonly add = output<Product>();
}
