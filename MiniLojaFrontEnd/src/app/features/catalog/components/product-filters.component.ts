import { Component, input, output } from '@angular/core';
import { Category } from '../../../shared/models/category';

export type FilterChange = Record<string, string | number | null>;

/** Sidebar do catálogo: categoria, faixa de preço e "somente com desconto". Só emite o que mudou. */
@Component({
  selector: 'app-product-filters',
  standalone: true,
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
})
export class ProductFiltersComponent {
  readonly categories = input.required<Category[]>();
  readonly categoria = input<number | null>(null);
  readonly de = input<number | null>(null);
  readonly ate = input<number | null>(null);
  readonly desconto = input(false);
  readonly filtersChange = output<FilterChange>();

  protected applyPrice(e: Event, min: string, max: string): void {
    e.preventDefault();
    this.filtersChange.emit({ de: min === '' ? null : Number(min), ate: max === '' ? null : Number(max), page: null });
  }
}
