import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';

export interface AdminProductRequest {
  name: string; description: string; price: number; originalPrice: number | null;
  stock: number; categoryId: number; imageUrl: string | null; active: boolean;
}
export interface AdminProductFilters { page?: number; size?: number; search?: string; category?: number | null; status?: string; }

@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/products`;

  list(f: AdminProductFilters = {}) {
    let params = new HttpParams().set('page', f.page ?? 0).set('size', f.size ?? 6);
    if (f.search) params = params.set('search', f.search);
    if (f.category) params = params.set('category', f.category);
    if (f.status) params = params.set('status', f.status);
    return this.http.get<Page<Product>>(this.url, { params });
  }

  /** Atenção: GET /admin/products/{id} precisa existir no back (traz inclusive produtos inativos). */
  get(id: number) { return this.http.get<Product>(`${this.url}/${id}`); }
  create(body: AdminProductRequest) { return this.http.post<Product>(this.url, body); }
  update(id: number, body: AdminProductRequest) { return this.http.put<Product>(`${this.url}/${id}`, body); }
  /** Soft delete no back (active = false). */
  remove(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
