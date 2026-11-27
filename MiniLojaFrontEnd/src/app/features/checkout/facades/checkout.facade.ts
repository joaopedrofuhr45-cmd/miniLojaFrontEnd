import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { CartService } from '@core/cart/services/cart.service';
import { PaymentMethod } from '@shared/models/order';
import { Address } from '@shared/models/user';
import { ServerError, toServerError } from '@shared/utils/server-error';
import { CheckoutService } from '../services/checkout.service';

/** Checkout: endereço salvo do cliente e criação do pedido (POST /orders). */
@Injectable()
export class CheckoutFacade {
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly router = inject(Router);

  readonly busy = signal(false);
  readonly error = signal('');

  /** Sem itens não há o que finalizar: volta para o carrinho. */
  redirectIfCartEmpty(): void {
    if (this.cart.items().length === 0) this.router.navigate(['/carrinho']);
  }

  /** Endereço do cadastro (GET /users/me), para pré-preencher. */
  savedAddress(): Promise<Address | null> {
    return firstValueFrom(this.checkout.profile().pipe(catchError(() => of(null)))).then((u) => u?.address ?? null);
  }

  /** Cria o pedido. Em caso de erro (ex.: estoque) mantém o carrinho e devolve os erros por campo. */
  async confirm(address: Address, paymentMethod: PaymentMethod): Promise<ServerError | null> {
    if (this.busy()) return null; // evita pedido duplicado
    this.error.set('');
    this.busy.set(true);
    try {
      await firstValueFrom(this.checkout.create({
        items: this.cart.items().map((i) => ({ productId: i.productId, quantity: i.quantity })),
        address,
        paymentMethod,
      }));
      this.cart.clear();
      this.router.navigate(['/pedidos']);
      return null;
    } catch (e) {
      const err = toServerError(e as HttpErrorResponse, 'Não foi possível confirmar o pedido.');
      this.error.set(err.message);
      this.busy.set(false);
      return err;
    }
  }
}
