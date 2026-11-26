import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { Order, OrderStatus, OrderSummary } from '@shared/models/order';
import { Page } from '@shared/models/page';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/orders`;

  list(f: { page?: number; size?: number; search?: string; status?: OrderStatus | '' } = {}) {
    let params = new HttpParams().set('page', f.page ?? 0).set('size', f.size ?? 5);
    if (f.search) params = params.set('search', f.search);
    if (f.status) params = params.set('status', f.status);
    return this.http.get<Page<Order>>(this.url, { params });
  }

  summary() { return this.http.get<OrderSummary>(`${this.url}/summary`); }
  get(id: number) { return this.http.get<Order>(`${this.url}/${id}`); }
  updateStatus(id: number, status: OrderStatus) { return this.http.patch<Order>(`${this.url}/${id}/status`, { status }); }
}
