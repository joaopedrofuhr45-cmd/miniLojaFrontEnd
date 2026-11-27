import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { ProductFilters } from '@shared/models/product-filters';
import { HomeService } from '../services/home.service';
import { Product } from '@shared/models/product';

/** Dados da home: categorias e as duas vitrines. `null` = carregando. */
@Injectable()
export class HomeFacade {
  private readonly home = inject(HomeService);

  readonly categories = inject(CategoriesService).categories;
  readonly offers = toSignal(this.load({ onSale: true, size: 4 }), { initialValue: null });
  readonly latest = toSignal(this.load({ sort: 'newest', size: 4 }), { initialValue: null });

  private load(filters: ProductFilters) {
    return this.home.products(filters).pipe(map((p) => p.content as Product[] | null), catchError(() => of([] as Product[])));
  }
}
