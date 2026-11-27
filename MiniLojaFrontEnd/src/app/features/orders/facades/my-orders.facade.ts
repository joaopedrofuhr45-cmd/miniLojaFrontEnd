import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CartService } from '@core/cart/services/cart.service';
import { ProductsService } from '@core/catalog/services/products.service';
import { OrdersService } from '@core/orders/services/orders.service';
import { Order, OrderStatus } from '@shared/models/order';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';

export type MyOrdersState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Order> };
export const ORDER_TABS: { key: string; label: string; status: OrderStatus | null }[] = [
  { key: '', label: 'Todos', status: null },
  { key: 'pendentes', label: 'Pendentes', status: 'PENDING' },
  { key: 'enviados', label: 'Enviados', status: 'SHIPPED' },
  { key: 'entregues', label: 'Entregues', status: 'DELIVERED' },
  { key: 'cancelados', label: 'Cancelados', status: 'CANCELED' },
];

/** Meus pedidos: lista (aba e página vêm da URL), cancelar e "comprar de novo". */
@Injectable()
export class MyOrdersFacade {
  private readonly orders = inject(OrdersService);
  private readonly products = inject(ProductsService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly reload = signal(0);
  readonly openId = signal<number | 'auto' | null>('auto'); // 'auto' = abre o primeiro pedido
  readonly cancelling = signal(false);
  readonly actionError = signal('');

  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly tab = computed(() => this.query().get('status') ?? '');
  readonly page = computed(() => Math.max(1, Number(this.query().get('page')) || 1));

  readonly state = toSignal(
    toObservable(computed(() => ({ tab: this.tab(), page: this.page(), r: this.reload() }))).pipe(
      switchMap(({ tab, page }): Observable<MyOrdersState> =>
        this.orders.mine({ page: page - 1, status: ORDER_TABS.find((t) => t.key === tab)?.status ?? null }).pipe(
          map((p): MyOrdersState => ({ status: 'ok', page: p })), startWith<MyOrdersState>({ status: 'loading' }), catchError(() => of<MyOrdersState>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as MyOrdersState },
  );

  retry(): void { this.reload.update((n) => n + 1); }

  setTab(key: string): void { this.router.navigate([], { relativeTo: this.route, queryParams: { status: key || null, page: null } }); this.openId.set('auto'); }
  setPage(p: number): void { this.router.navigate([], { relativeTo: this.route, queryParams: { page: p }, queryParamsHandling: 'merge' }); this.openId.set('auto'); }

  isOpen(o: Order, list: Order[]): boolean { const id = this.openId(); return id === 'auto' ? list[0]?.id === o.id : id === o.id; }
  toggle(o: Order, list: Order[]): void { this.openId.set(this.isOpen(o, list) ? null : o.id); }

  async cancel(order: Order): Promise<void> {
    this.cancelling.set(true); this.actionError.set('');
    try {
      await firstValueFrom(this.orders.cancel(order.id));
      this.retry();
    } catch (e) {
      this.actionError.set((e as HttpErrorResponse).error?.message ?? 'Não foi possível cancelar o pedido.');
    } finally {
      this.cancelling.set(false);
    }
  }

  /** "Comprar de novo": busca o produto atual (preço/estoque de hoje), põe no carrinho e abre /carrinho. */
  async reorder(o: Order): Promise<void> {
    const rows = await firstValueFrom(forkJoin(o.items.map((i) => this.products.get(i.productId).pipe(map((p) => ({ p, q: i.quantity })), catchError(() => of(null))))));
    const found = rows.filter((r): r is { p: Product; q: number } => r !== null);
    found.forEach(({ p, q }) => this.cart.add(p, q));
    if (found.length < rows.length) this.actionError.set('Alguns produtos não estão mais disponíveis.');
    if (found.length) this.router.navigate(['/carrinho']);
  }
}
