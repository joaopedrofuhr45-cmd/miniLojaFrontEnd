import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { Order, OrderStatus } from '@shared/models/order';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';

/** Chamadas de "Meus pedidos" ao back. */
@Injectable({ providedIn: 'root' })
export class MyOrdersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/orders`;

  mine(opts: { page?: number; size?: number; status?: OrderStatus | null } = {}) {
    let params = new HttpParams().set('page', opts.page ?? 0).set('size', opts.size ?? 10);
    if (opts.status) params = params.set('status', opts.status);
    return this.http.get<Page<Order>>(`${this.url}/me`, { params });
  }

  cancel(id: number) { return this.http.patch<Order>(`${this.url}/${id}/cancel`, {}); }

  /** Produto atual (preço e estoque de hoje) para "comprar de novo". */
  product(id: number) { return this.http.get<Product>(`${environment.apiUrl}/products/${id}`); }
}
