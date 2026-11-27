import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '@shared/models/order';
import { ORDER_STATUS } from '@shared/pipes/order-status/order-status.pipe';
import { BadgeComponent } from '@shared/ui/badge/badge.component';

@Component({
  selector: 'ui-order-status-badge',
  standalone: true,
  imports: [BadgeComponent],
  templateUrl: './order-status-badge.component.html',
})
export class OrderStatusBadgeComponent {
  readonly status = input.required<OrderStatus>();
  protected readonly info = computed(() => ORDER_STATUS[this.status()]);
}
