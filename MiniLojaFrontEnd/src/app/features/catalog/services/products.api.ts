import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../shared/models/page';
import { Product } from '../../../shared/models/product';

export type ProductSort = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export interface ProductFilters {
  page?: number; // 0-based
  size?: number;
  search?: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: ProductSort;
}

/** Fica em core porque home, catálogo, detalhe e pedidos usam (features não importam umas das outras). */
@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/products`;

  list(f: ProductFilters = {}) {
    let params = new HttpParams().set('page', f.page ?? 0).set('size', f.size ?? 8);
    if (f.search) params = params.set('search', f.search);
    if (f.category) params = params.set('category', f.category);
    if (f.minPrice != null) params = params.set('minPrice', f.minPrice);
    if (f.maxPrice != null) params = params.set('maxPrice', f.maxPrice);
    if (f.onSale) params = params.set('onSale', true);
    if (f.sort) params = params.set('sort', f.sort);
    return this.http.get<Page<Product>>(this.url, { params });
  }

  get(id: number) { return this.http.get<Product>(`${this.url}/${id}`); }
}
