import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateOrderRequest, Order, OrderStatus } from '../../shared/models/order';
import { Page } from '../../shared/models/page';

/** Fica em core porque checkout (POST) e "Meus pedidos" (GET/cancel) usam. */
@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/orders`;

  create(body: CreateOrderRequest) { return this.http.post<Order>(this.url, body); }

  mine(opts: { page?: number; size?: number; status?: OrderStatus | null } = {}) {
    let params = new HttpParams().set('page', opts.page ?? 0).set('size', opts.size ?? 10);
    if (opts.status) params = params.set('status', opts.status);
    return this.http.get<Page<Order>>(`${this.url}/me`, { params });
  }

  get(id: number) { return this.http.get<Order>(`${this.url}/${id}`); }
  cancel(id: number) { return this.http.patch<Order>(`${this.url}/${id}/cancel`, {}); }
}
