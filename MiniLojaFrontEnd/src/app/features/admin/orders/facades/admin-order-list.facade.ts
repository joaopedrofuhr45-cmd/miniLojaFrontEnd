import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, firstValueFrom, map, Observable, of, startWith, switchMap } from 'rxjs';
import { Order, OrderStatus } from '@shared/models/order';
import { Page } from '@shared/models/page';
import { nextStatuses } from '@shared/utils/order-flow';
import { AdminOrdersService } from '../services/admin-orders.service';

export type AdminOrderListState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Order> };

/** Admin · pedidos: lista com filtros, resumo, detalhe do pedido selecionado e troca de status. */
@Injectable()
export class AdminOrderListFacade {
  private readonly admin = inject(AdminOrdersService);

  readonly q = signal('');
  readonly statusFilter = signal<OrderStatus | ''>('');
  readonly page = signal(1);
  private readonly reload = signal(0);
  readonly selectedId = signal<number | null>(null);
  readonly newStatus = signal<OrderStatus>('PENDING');
  readonly saving = signal(false);
  readonly message = signal('');
  readonly failed = signal(false);

  readonly state = toSignal(
    toObservable(computed(() => ({ q: this.q(), st: this.statusFilter(), page: this.page(), r: this.reload() }))).pipe(
      debounceTime(200),
      switchMap((f): Observable<AdminOrderListState> =>
        this.admin.list({ page: f.page - 1, search: f.q, status: f.st }).pipe(
          map((page): AdminOrderListState => ({ status: 'ok', page })), startWith<AdminOrderListState>({ status: 'loading' }), catchError(() => of<AdminOrderListState>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as AdminOrderListState },
  );

  readonly summary = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.admin.summary().pipe(catchError(() => of(null))))),
    { initialValue: null },
  );

  /** Pedido selecionado; sem seleção, o primeiro da lista (como no Figma). */
  readonly activeId = computed(() => {
    const s = this.state();
    return this.selectedId() ?? (s.status === 'ok' ? (s.page.content[0]?.id ?? null) : null);
  });

  readonly detail = toSignal(
    toObservable(computed(() => ({ id: this.activeId(), r: this.reload() }))).pipe(
      filter((x): x is { id: number; r: number } => x.id !== null),
      switchMap(({ id }) => this.admin.get(id).pipe(catchError(() => of(null)))),
    ),
    { initialValue: null as Order | null },
  );

  /** O select só oferece o status atual e as transições válidas. */
  readonly options = computed<OrderStatus[]>(() => { const d = this.detail(); return d ? [d.status, ...nextStatuses(d.status)] : []; });

  constructor() {
    effect(() => { const d = this.detail(); if (d) this.newStatus.set(d.status); }, { allowSignalWrites: true });
  }

  retry(): void { this.reload.update((n) => n + 1); }
  setSearch(v: string): void { this.q.set(v.trim()); this.page.set(1); }
  setStatusFilter(v: OrderStatus | ''): void { this.statusFilter.set(v); this.page.set(1); }
  setPage(p: number): void { this.page.set(p); }
  select(id: number): void { this.selectedId.set(id); }

  async saveStatus(o: Order): Promise<void> {
    this.saving.set(true); this.message.set('');
    try {
      await firstValueFrom(this.admin.updateStatus(o.id, this.newStatus()));
      this.failed.set(false); this.message.set('Status atualizado.'); this.retry();
    } catch (e) {
      this.failed.set(true); this.message.set((e as HttpErrorResponse).error?.message ?? 'Não foi possível atualizar o status.');
    } finally {
      this.saving.set(false);
    }
  }
}
