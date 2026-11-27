import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Order, PaymentMethod } from '@shared/models/order';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { OrderStatusBadgeComponent } from '@shared/ui/order-status-badge/order-status-badge.component';
import { ProductThumbComponent } from '@shared/ui/product-thumb/product-thumb.component';
import { OrderTimelineComponent } from '../order-timeline/order-timeline.component';

const PAYMENT: Record<PaymentMethod, string> = { PIX: 'Pix', CARD: 'Cartão de crédito', BOLETO: 'Boleto' };

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [DatePipe, BrlPipe, ButtonComponent, OrderStatusBadgeComponent, ProductThumbComponent, OrderTimelineComponent],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
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
