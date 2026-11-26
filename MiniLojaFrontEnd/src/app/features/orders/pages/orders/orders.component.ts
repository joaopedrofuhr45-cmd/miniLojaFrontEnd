import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CartService } from '@core/cart/services/cart.service';
import { ProductsService } from '@core/catalog/services/products.service';
import { OrdersService } from '@core/orders/services/orders.service';
import { Order, OrderStatus } from '@shared/models/order';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { OrderCardComponent } from '../../components/order-card/order-card.component';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Order> };
const TABS: { key: string; label: string; status: OrderStatus | null }[] = [
  { key: '', label: 'Todos', status: null }, { key: 'pendentes', label: 'Pendentes', status: 'PENDING' }, { key: 'enviados', label: 'Enviados', status: 'SHIPPED' },
  { key: 'entregues', label: 'Entregues', status: 'DELIVERED' }, { key: 'cancelados', label: 'Cancelados', status: 'CANCELED' },
];

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, ModalComponent, PaginationComponent, OrderCardComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  private readonly api = inject(OrdersService);
  private readonly products = inject(ProductsService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly tabs = TABS;
  protected readonly reload = signal(0);
  protected readonly openId = signal<number | 'auto' | null>('auto'); // 'auto' = abre o primeiro pedido
  protected readonly toCancel = signal<Order | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly actionError = signal('');

  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly tab = computed(() => this.query().get('status') ?? '');
  protected readonly page = computed(() => Math.max(1, Number(this.query().get('page')) || 1));

  protected readonly state = toSignal(
    toObservable(computed(() => ({ tab: this.tab(), page: this.page(), r: this.reload() }))).pipe(
      switchMap(({ tab, page }): Observable<State> =>
        this.api.mine({ page: page - 1, status: TABS.find((t) => t.key === tab)?.status ?? null }).pipe(
          map((p): State => ({ status: 'ok', page: p })), startWith<State>({ status: 'loading' }), catchError(() => of<State>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected setTab(key: string): void { this.router.navigate([], { relativeTo: this.route, queryParams: { status: key || null, page: null } }); this.openId.set('auto'); }
  protected setPage(p: number): void { this.router.navigate([], { relativeTo: this.route, queryParams: { page: p }, queryParamsHandling: 'merge' }); this.openId.set('auto'); }

  protected isOpen(o: Order, list: Order[]): boolean { const id = this.openId(); return id === 'auto' ? list[0]?.id === o.id : id === o.id; }
  protected toggle(o: Order): void {
    const list = (this.state() as Extract<State, { status: 'ok' }>).page.content;
    this.openId.set(this.isOpen(o, list) ? null : o.id);
  }

  protected confirmCancel(): void {
    const order = this.toCancel(); if (!order) return;
    this.cancelling.set(true); this.actionError.set('');
    this.api.cancel(order.id).subscribe({
      next: () => { this.cancelling.set(false); this.toCancel.set(null); this.reload.set(this.reload() + 1); },
      error: (e: HttpErrorResponse) => {
        this.cancelling.set(false); this.toCancel.set(null);
        this.actionError.set(e.error?.message ?? 'Não foi possível cancelar o pedido.');
      },
    });
  }

  /** "Comprar de novo": busca o produto atual (preço/estoque de hoje), põe no carrinho e abre /carrinho. */
  protected reorder(o: Order): void {
    forkJoin(o.items.map((i) => this.products.get(i.productId).pipe(map((p) => ({ p, q: i.quantity })), catchError(() => of(null)))))
      .subscribe((rows) => {
        const found = rows.filter((r): r is { p: Product; q: number } => r !== null);
        found.forEach(({ p, q }) => this.cart.add(p, q));
        if (found.length < rows.length) this.actionError.set('Alguns produtos não estão mais disponíveis.');
        if (found.length) this.router.navigate(['/carrinho']);
      });
  }
}
