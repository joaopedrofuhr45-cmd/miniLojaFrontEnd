import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '../models/order';
import { ORDER_STATUS } from '../pipes/order-status.pipe';
import { BadgeComponent } from './badge.component';

@Component({
  selector: 'ui-order-status-badge',
  standalone: true,
  imports: [BadgeComponent],
  template: `<ui-badge [tone]="info().tone">{{ info().label.toUpperCase() }}</ui-badge>`,
})
export class OrderStatusBadgeComponent {
  readonly status = input.required<OrderStatus>();
  protected readonly info = computed(() => ORDER_STATUS[this.status()]);
}
