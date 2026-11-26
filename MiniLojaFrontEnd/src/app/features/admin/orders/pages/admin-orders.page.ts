import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { Order, OrderStatus } from '../../../../shared/models/order';
import { Page } from '../../../../shared/models/page';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { ORDER_STATUS, OrderStatusPipe } from '../../../../shared/pipes/order-status.pipe';
import { ButtonComponent } from '../../../../shared/ui/button.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state.component';
import { OrderStatusBadgeComponent } from '../../../../shared/ui/order-status-badge.component';
import { PaginationComponent } from '../../../../shared/ui/pagination.component';
import { nextStatuses } from '../../../../shared/utils/order-flow';
import { AdminOrdersApi } from '../data/admin-orders.api';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Order> };

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [DatePipe, BrlPipe, OrderStatusPipe, ButtonComponent, EmptyStateComponent, OrderStatusBadgeComponent, PaginationComponent],
  template: `
    <div class="head"><h1>Pedidos</h1><p class="muted">Acompanhe e atualize o status</p></div>

    <div class="stats">
      <div class="card stat"><span>Pendentes</span><b class="warn">{{ summary()?.pending ?? '–' }}</b></div>
      <div class="card stat"><span>Pagos</span><b class="info">{{ summary()?.paid ?? '–' }}</b></div>
      <div class="card stat"><span>Enviados</span><b class="brand">{{ summary()?.shipped ?? '–' }}</b></div>
      <div class="card stat"><span>Faturamento do mês</span><b class="big">{{ summary() ? (summary()!.monthRevenue | brl: 0) : '–' }}</b></div>
    </div>

    <div class="cols">
      <section class="card box">
        <div class="filters">
          <input class="input" type="search" placeholder="Buscar por nº ou cliente..." aria-label="Buscar pedido" (input)="onSearch($event)" />
          <select class="input" aria-label="Status" (change)="onStatus($event)">
            <option value="">Status</option>@for (s of statuses; track s) { <option [value]="s">{{ s | orderStatus }}</option> }
          </select>
        </div>
        @if (state(); as s) {
          @if (s.status === 'loading') { <div class="skeleton" style="height:320px"></div> }
          @else if (s.status === 'error') {
            <ui-empty-state icon="x" title="Não deu pra carregar os pedidos"><button uiButton variant="cta" (click)="reload.set(reload() + 1)">Tentar de novo</button></ui-empty-state>
          } @else if (s.page.content.length === 0) { <ui-empty-state icon="doc" title="Nenhum pedido encontrado" message="Ajuste a busca ou o filtro." /> }
          @else {
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  @for (o of s.page.content; track o.id) {
                    <tr [class.sel]="o.id === activeId()">
                      <td><b>#{{ o.id }}</b></td><td>{{ o.customerName }}</td>
                      <td class="muted">{{ o.createdAt | date: 'dd/MM/yyyy' }}</td><td><b>{{ o.total | brl }}</b></td>
                      <td><ui-order-status-badge [status]="o.status" /></td>
                      <td class="right"><button uiButton variant="outline" size="sm" type="button" [attr.aria-pressed]="o.id === activeId()" (click)="selectedId.set(o.id)">Detalhes</button></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <ui-pagination [page]="page()" [totalPages]="s.page.totalPages" (pageChange)="page.set($event)" />
          }
        }
      </section>

      <aside class="card panel" aria-live="polite">
        @if (detail(); as o) {
          <h2>Pedido #{{ o.id }}</h2>
          <p class="muted">{{ o.customerName }} · {{ o.createdAt | date: 'dd/MM/yyyy' }}</p>
          <ul>@for (i of o.items; track i.productId) { <li><span>{{ i.quantity }} × {{ i.name }}</span><span>{{ i.unitPrice * i.quantity | brl }}</span></li> }</ul>
          <p class="line"><span>Frete</span>@if (o.shipping === 0) { <b class="free">Grátis</b> } @else { <span>{{ o.shipping | brl }}</span> }</p>
          <p class="line total"><b>Total</b><b>{{ o.total | brl }}</b></p>
          <div class="field">
            <label for="status">Atualizar status</label>
            <select id="status" class="input" [disabled]="options().length === 1" (change)="newStatus.set($any($event.target).value)">
              @for (s of options(); track s) { <option [value]="s" [selected]="s === newStatus()">{{ labelOf(s) }}</option> }
            </select>
            <span class="hint">{{ options().length === 1 ? 'Pedido finalizado: não há próximas etapas.' : 'Fluxo: PENDENTE → PAGO → ENVIADO → ENTREGUE (ou CANCELADO)' }}</span>
          </div>
          @if (message()) { <p class="alert" [class.ok]="!failed()" [class.error]="failed()" role="status">{{ message() }}</p> }
          <button uiButton variant="cta" size="lg" [block]="true" [disabled]="saving() || newStatus() === o.status" (click)="saveStatus(o)">{{ saving() ? 'Salvando…' : 'Salvar status' }}</button>
        } @else { <ui-empty-state icon="doc" title="Selecione um pedido" message="Clique em Detalhes para ver e atualizar o status." /> }
      </aside>
    </div>`,
  styles: [`
    :host { display: grid; gap: 20px; align-content: start; } .head h1 { font-size: 28px; font-weight: 700; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat { padding: 20px 22px; display: grid; gap: 4px; color: var(--ink2); } .stat b { font-size: 32px; font-weight: 700; line-height: 1.1; }
    .stat .warn { color: var(--warn); } .stat .info { color: var(--info); } .stat .brand { color: var(--brand); } .stat .big { color: var(--ink); }
    .cols { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
    .box { padding: 16px; display: grid; gap: 14px; } .filters { display: grid; grid-template-columns: 1fr 160px; gap: 12px; }
    tr.sel td { background: var(--brand-soft); } .right { text-align: right; }
    .panel { padding: 22px; display: grid; gap: 12px; } .panel h2 { font-size: 20px; font-weight: 700; }
    ul { display: grid; gap: 6px; padding: 8px 0; border-bottom: 1px solid var(--line); } li { display: flex; justify-content: space-between; color: var(--ink2); }
    .line { display: flex; justify-content: space-between; color: var(--ink2); } .free { color: var(--ok); } .total { color: var(--ink); font-size: 18px; padding-top: 8px; border-top: 1px solid var(--line); } .total b:last-child { font-size: 22px; }
    @media (max-width: 1100px) { .cols { grid-template-columns: 1fr; } .stats { grid-template-columns: 1fr 1fr; } }
  `],
})
export class AdminOrdersPage {
  private readonly api = inject(AdminOrdersApi);
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
