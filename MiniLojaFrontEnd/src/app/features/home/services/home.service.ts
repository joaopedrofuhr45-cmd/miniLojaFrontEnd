import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { ProductFilters } from '@shared/models/product-filters';
import { toProductParams } from '@shared/utils/product-params';

/** Chamadas da home ao back: as vitrines (ofertas e lançamentos) saem de GET /products. */
@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly http = inject(HttpClient);

  products(filters: ProductFilters) {
    return this.http.get<Page<Product>>(`${environment.apiUrl}/products`, { params: toProductParams(filters) });
  }
}
