import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '../../../shared/models/order';

const STEPS = ['Pedido feito', 'Pago', 'Enviado', 'Entrega'];
const REACHED: Record<OrderStatus, number> = { PENDING: 0, PAID: 1, SHIPPED: 2, DELIVERED: 3, CANCELED: -1 };

/** Linha do tempo: Pedido feito → Pago → Enviado → Entrega. */
@Component({
  selector: 'app-order-timeline',
  standalone: true,
  templateUrl: './order-timeline.component.html',
  styleUrl: './order-timeline.component.scss',
})
export class OrderTimelineComponent {
  readonly status = input.required<OrderStatus>();
  protected readonly steps = STEPS;
  protected readonly reached = computed(() => REACHED[this.status()]);
}
