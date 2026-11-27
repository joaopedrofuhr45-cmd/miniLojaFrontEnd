import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { ProductFilters } from '@shared/models/product-filters';
import { toProductParams } from '@shared/utils/product-params';

/** Chamadas do catálogo ao back: GET /products com filtros. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  list(filters: ProductFilters = {}) {
    return this.http.get<Page<Product>>(`${environment.apiUrl}/products`, { params: toProductParams(filters) });
  }
}
