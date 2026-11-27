import { HttpParams } from '@angular/common/http';
import { ProductFilters } from '../models/product-filters';

/** Monta a query string de GET /products (só manda o que foi preenchido). */
export function toProductParams(f: ProductFilters = {}): HttpParams {
  let params = new HttpParams().set('page', f.page ?? 0).set('size', f.size ?? 8);
  if (f.search) params = params.set('search', f.search);
  if (f.category) params = params.set('category', f.category);
  if (f.minPrice != null) params = params.set('minPrice', f.minPrice);
  if (f.maxPrice != null) params = params.set('maxPrice', f.maxPrice);
  if (f.onSale) params = params.set('onSale', true);
  if (f.sort) params = params.set('sort', f.sort);
  return params;
}
