import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Order, PaymentMethod } from '../../../shared/models/order';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { OrderStatusBadgeComponent } from '../../../shared/ui/order-status-badge.component';
import { ProductThumbComponent } from '../../../shared/ui/product-thumb.component';
import { OrderTimelineComponent } from './order-timeline.component';

const PAYMENT: Record<PaymentMethod, string> = { PIX: 'Pix', CARD: 'Cartão de crédito', BOLETO: 'Boleto' };

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [DatePipe, BrlPipe, ButtonComponent, OrderStatusBadgeComponent, ProductThumbComponent, OrderTimelineComponent],
  template: `
    <article class="card">
      <header>
        <ui-order-status-badge [status]="order().status" />
        <time [attr.datetime]="order().createdAt">{{ order().createdAt | date: 'dd/MM/yyyy' }}</time>
        <b class="id">Pedido #{{ order().id }}</b>
      </header>
      <div class="main">
        <div class="thumbs">@for (i of firstItems(); track i.productId) { <span><ui-product-thumb [seed]="i.productId" [imageUrl]="i.imageUrl" [iconSize]="24" /></span> }</div>
        <b class="title">{{ title() }}</b>
        <div class="total"><small>Total</small><b>{{ order().total | brl }}</b></div>
        <div class="actions">
          <button uiButton variant="outline" size="sm" type="button" [attr.aria-expanded]="open()" (click)="toggle.emit()">{{ open() ? 'Ocultar detalhes' : 'Ver detalhes' }}</button>
          @if (order().status === 'DELIVERED') { <button uiButton variant="line" size="sm" type="button" (click)="reorder.emit()">Comprar de novo</button> }
        </div>
      </div>
      @if (open()) {
        <div class="details">
          @if (order().status === 'CANCELED') { <p class="canceled">Este pedido foi cancelado.</p> } @else { <app-order-timeline [status]="order().status" /> }
          <ul>@for (i of order().items; track i.productId) { <li><span>{{ i.quantity }} × {{ i.name }}</span><span>{{ i.unitPrice * i.quantity | brl }}</span></li> }</ul>
          <p class="meta">Entrega em: {{ order().address.street }}, {{ order().address.number }} — {{ order().address.city }}/{{ order().address.state }} · Pagamento: {{ payment() }}</p>
          @if (order().status === 'PENDING') { <button uiButton variant="danger" size="sm" type="button" (click)="cancel.emit()">Cancelar pedido</button> }
        </div>
      }
    </article>`,
  styles: [`
    article { overflow: hidden; border: 1px solid var(--line); }
    header { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #f7f7f7; color: var(--muted); } .id { margin-left: auto; color: var(--ink); }
    .main { display: flex; align-items: center; gap: 16px; padding: 18px 20px; flex-wrap: wrap; }
    .thumbs { display: flex; gap: 12px; } .thumbs span { width: 54px; height: 54px; border-radius: 4px; overflow: hidden; }
    .title { flex: 1; min-width: 140px; } .total { display: grid; justify-items: end; margin-left: auto; } .total small { font-size: 11px; color: var(--muted); } .total b { font-size: 24px; font-weight: 600; }
    .actions { display: grid; gap: 8px; }
    .details { display: grid; gap: 14px; padding: 4px 20px 20px; } .canceled { color: var(--danger); font-weight: 600; }
    ul { display: grid; gap: 4px; padding-top: 12px; border-top: 1px solid var(--line); } li { display: flex; justify-content: space-between; color: var(--ink2); }
    .meta { text-align: center; font-size: 12px; color: var(--ink2); } button[uiButton] { justify-self: start; }
  `],
})
export class OrderCardComponent {
  readonly order = input.required<Order>();
  readonly open = input(false);
  readonly toggle = output<void>();
  readonly cancel = output<void>();
  readonly reorder = output<void>();

  protected readonly firstItems = computed(() => this.order().items.slice(0, 3));
  protected readonly payment = computed(() => PAYMENT[this.order().paymentMethod]);
  protected readonly title = computed(() => {
    const items = this.order().items; const rest = items.length - 1;
    return rest > 0 ? `${items[0].name} e mais ${rest} ${rest === 1 ? 'produto' : 'produtos'}` : (items[0]?.name ?? 'Pedido');
  });
}
