import { AdminOrderListFacade } from '../../facades/admin-order-list.facade';
import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Order, OrderStatus } from '@shared/models/order';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { ORDER_STATUS, OrderStatusPipe } from '@shared/pipes/order-status/order-status.pipe';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { OrderStatusBadgeComponent } from '@shared/ui/order-status-badge/order-status-badge.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';


@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [DatePipe, BrlPipe, OrderStatusPipe, ButtonComponent, EmptyStateComponent, OrderStatusBadgeComponent, PaginationComponent],
  providers: [AdminOrderListFacade],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent {
  private readonly list = inject(AdminOrderListFacade);

  protected readonly statuses = Object.keys(ORDER_STATUS) as OrderStatus[];
  protected readonly page = this.list.page;
  protected readonly state = this.list.state;
  protected readonly summary = this.list.summary;
  protected readonly activeId = this.list.activeId;
  protected readonly detail = this.list.detail;
  protected readonly options = this.list.options;
  protected readonly newStatus = this.list.newStatus;
  protected readonly saving = this.list.saving;
  protected readonly message = this.list.message;
  protected readonly failed = this.list.failed;

  protected retry(): void { this.list.retry(); }
  protected setPage(p: number): void { this.list.setPage(p); }
  protected select(id: number): void { this.list.select(id); }
  protected saveStatus(o: Order): void { void this.list.saveStatus(o); }

  protected labelOf(s: OrderStatus): string { return ORDER_STATUS[s].label.toUpperCase(); }
  protected onSearch(e: Event): void { this.list.setSearch((e.target as HTMLInputElement).value); }
  protected onStatus(e: Event): void { this.list.setStatusFilter((e.target as HTMLSelectElement).value as OrderStatus | ''); }
}
