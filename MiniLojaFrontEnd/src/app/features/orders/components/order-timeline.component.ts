import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '../../../shared/models/order';

const STEPS = ['Pedido feito', 'Pago', 'Enviado', 'Entrega'];
const REACHED: Record<OrderStatus, number> = { PENDING: 0, PAID: 1, SHIPPED: 2, DELIVERED: 3, CANCELED: -1 };

/** Linha do tempo: Pedido feito → Pago → Enviado → Entrega. */
@Component({
  selector: 'app-order-timeline',
  standalone: true,
  template: `
    <ol [attr.aria-label]="'Andamento do pedido: ' + steps[reached()]">
      @for (s of steps; track s; let i = $index) {
        <li [class.done]="i < reached() || (reached() === 3 && i === 3)" [class.now]="i === reached() && reached() < 3" [attr.aria-current]="i === reached() ? 'step' : null">
          <span class="dot"></span><span class="label">{{ s }}</span>
        </li>
      }
    </ol>`,
  styles: [`
    ol { display: grid; grid-template-columns: repeat(4, 1fr); }
    li { position: relative; display: grid; justify-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
    li::before { content: ''; position: absolute; top: 5px; left: -50%; width: 100%; height: 2px; background: #d9d9d9; } li:first-child::before { display: none; }
    li.done::before, li.now::before { background: var(--ok); }
    .dot { position: relative; z-index: 1; width: 12px; height: 12px; border-radius: 50%; background: #d4d4d4; }
    .done .dot { background: var(--ok); } .now .dot { background: var(--brand); } .now .label { color: var(--brand); font-weight: 700; } .done .label { color: var(--ink2); }
  `],
})
export class OrderTimelineComponent {
  readonly status = input.required<OrderStatus>();
  protected readonly steps = STEPS;
  protected readonly reached = computed(() => REACHED[this.status()]);
}
