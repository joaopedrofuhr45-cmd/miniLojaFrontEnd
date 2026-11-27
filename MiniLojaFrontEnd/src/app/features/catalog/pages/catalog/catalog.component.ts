import { CatalogFacade, Ordem } from '../../facades/catalog.facade';
import { FilterChange } from '../../models/filter-change';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@core/cart/services/cart.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { ProductCardComponent } from '@shared/ui/product-card/product-card.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';



const SORT_OPTIONS: { value: Ordem; label: string }[] = [
  { value: 'relevantes', label: 'Mais relevantes' }, { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' }, { value: 'lancamentos', label: 'Lançamentos' },
];

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, IconComponent, PaginationComponent, ProductCardComponent, ProductFiltersComponent],
  providers: [CatalogFacade],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  private readonly catalog = inject(CatalogFacade);
  protected readonly cart = inject(CartService);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  protected readonly categories = this.catalog.categories;
  protected readonly f = this.catalog.f;
  protected readonly state = this.catalog.state;
  protected readonly total = this.catalog.total;
  protected readonly chips = this.catalog.chips;

  protected set(changes: FilterChange): void { this.catalog.set(changes); }
  protected clearAll(): void { this.catalog.clearAll(); }
  protected retry(): void { this.catalog.retry(); }
  protected onSort(e: Event): void { this.set({ ordem: (e.target as HTMLSelectElement).value, page: null }); }
}
