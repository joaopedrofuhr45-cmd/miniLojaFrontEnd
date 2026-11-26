import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { Order, OrderStatus } from '@shared/models/order';
import { Page } from '@shared/models/page';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { ORDER_STATUS, OrderStatusPipe } from '@shared/pipes/order-status/order-status.pipe';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { OrderStatusBadgeComponent } from '@shared/ui/order-status-badge/order-status-badge.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { nextStatuses } from '@shared/utils/order-flow';
import { AdminOrdersService } from '../../services/admin-orders.service';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Order> };

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [DatePipe, BrlPipe, OrderStatusPipe, ButtonComponent, EmptyStateComponent, OrderStatusBadgeComponent, PaginationComponent],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent {
  private readonly api = inject(AdminOrdersService);
  protected readonly statuses = Object.keys(ORDER_STATUS) as OrderStatus[];

  protected readonly q = signal('');
  protected readonly statusFilter = signal<OrderStatus | ''>('');
  protected readonly page = signal(1);
  protected readonly reload = signal(0);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly newStatus = signal<OrderStatus>('PENDING');
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly failed = signal(false);

  protected readonly state = toSignal(
    toObservable(computed(() => ({ q: this.q(), st: this.statusFilter(), page: this.page(), r: this.reload() }))).pipe(
      debounceTime(200),
      switchMap((f): Observable<State> =>
        this.api.list({ page: f.page - 1, search: f.q, status: f.st }).pipe(
          map((page): State => ({ status: 'ok', page })), startWith<State>({ status: 'loading' }), catchError(() => of<State>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected readonly summary = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.api.summary().pipe(catchError(() => of(null))))),
    { initialValue: null },
  );

  /** Pedido selecionado; sem seleção, o primeiro da lista (como no Figma). */
  protected readonly activeId = computed(() => {
    const s = this.state();
    return this.selectedId() ?? (s.status === 'ok' ? (s.page.content[0]?.id ?? null) : null);
  });

  protected readonly detail = toSignal(
    toObservable(computed(() => ({ id: this.activeId(), r: this.reload() }))).pipe(
      filter((x): x is { id: number; r: number } => x.id !== null),
      switchMap(({ id }) => this.api.get(id).pipe(catchError(() => of(null)))),
    ),
    { initialValue: null as Order | null },
  );

  /** O select só oferece o status atual e as transições válidas. */
  protected readonly options = computed<OrderStatus[]>(() => { const d = this.detail(); return d ? [d.status, ...nextStatuses(d.status)] : []; });

  constructor() {
    effect(() => { const d = this.detail(); if (d) this.newStatus.set(d.status); }, { allowSignalWrites: true });
  }

  protected labelOf(s: OrderStatus): string { return ORDER_STATUS[s].label.toUpperCase(); }
  protected onSearch(e: Event): void { this.q.set((e.target as HTMLInputElement).value.trim()); this.page.set(1); }
  protected onStatus(e: Event): void { this.statusFilter.set((e.target as HTMLSelectElement).value as OrderStatus | ''); this.page.set(1); }

  protected saveStatus(o: Order): void {
    this.saving.set(true); this.message.set('');
    this.api.updateStatus(o.id, this.newStatus()).subscribe({
      next: () => { this.saving.set(false); this.failed.set(false); this.message.set('Status atualizado.'); this.reload.set(this.reload() + 1); },
      error: (e: HttpErrorResponse) => { this.saving.set(false); this.failed.set(true); this.message.set(e.error?.message ?? 'Não foi possível atualizar o status.'); },
    });
  }
}
