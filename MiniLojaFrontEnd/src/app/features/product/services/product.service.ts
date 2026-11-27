import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { toProductParams } from '@shared/utils/product-params';

/** Chamadas do detalhe do produto ao back. */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/products`;

  get(id: number) { return this.http.get<Product>(`${this.url}/${id}`); }

  /** Produtos da mesma categoria (para "quem viu também comprou"). */
  byCategory(category: number, size: number) {
    return this.http.get<Page<Product>>(this.url, { params: toProductParams({ category, size }) });
  }
}
