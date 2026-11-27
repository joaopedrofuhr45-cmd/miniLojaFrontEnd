import { MyOrdersFacade, ORDER_TABS } from '../../facades/my-orders.facade';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '@shared/models/order';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { OrderCardComponent } from '../../components/order-card/order-card.component';


@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, ModalComponent, PaginationComponent, OrderCardComponent],
  providers: [MyOrdersFacade],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  private readonly orders = inject(MyOrdersFacade);

  protected readonly tabs = ORDER_TABS;
  protected readonly toCancel = signal<Order | null>(null); // pedido no modal de confirmação
  protected readonly state = this.orders.state;
  protected readonly tab = this.orders.tab;
  protected readonly page = this.orders.page;
  protected readonly actionError = this.orders.actionError;
  protected readonly cancelling = this.orders.cancelling;

  protected retry(): void { this.orders.retry(); }
  protected setTab(key: string): void { this.orders.setTab(key); }
  protected setPage(p: number): void { this.orders.setPage(p); }
  protected isOpen(o: Order, list: Order[]): boolean { return this.orders.isOpen(o, list); }
  protected toggle(o: Order, list: Order[]): void { this.orders.toggle(o, list); }
  protected reorder(o: Order): void { void this.orders.reorder(o); }

  protected async confirmCancel(): Promise<void> {
    const order = this.toCancel(); if (!order) return;
    await this.orders.cancel(order);
    this.toCancel.set(null);
  }
}
