import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { ProductsService } from '@core/catalog/services/products.service';
import { Product } from '@shared/models/product';

/** Dados da home: categorias e as duas vitrines. `null` = carregando. */
@Injectable()
export class HomeFacade {
  private readonly products = inject(ProductsService);

  readonly categories = inject(CategoriesService).categories;
  readonly offers = toSignal(this.load({ onSale: true, size: 4 }), { initialValue: null });
  readonly latest = toSignal(this.load({ sort: 'newest', size: 4 }), { initialValue: null });

  private load(filters: Parameters<ProductsService['list']>[0]) {
    return this.products.list(filters).pipe(map((p) => p.content as Product[] | null), catchError(() => of([] as Product[])));
  }
}
