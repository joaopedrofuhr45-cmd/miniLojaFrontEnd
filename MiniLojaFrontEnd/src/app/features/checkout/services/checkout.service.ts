import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { CreateOrderRequest, Order } from '@shared/models/order';
import { UserProfile } from '@shared/models/user';

/** Chamadas do checkout ao back. */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);

  create(body: CreateOrderRequest) { return this.http.post<Order>(`${environment.apiUrl}/orders`, body); }

  /** Perfil do cliente (traz o endereço do cadastro para pré-preencher). */
  profile() { return this.http.get<UserProfile>(`${environment.apiUrl}/users/me`); }
}
