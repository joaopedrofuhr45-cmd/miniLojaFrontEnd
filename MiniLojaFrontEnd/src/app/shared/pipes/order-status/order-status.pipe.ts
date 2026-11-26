import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../../models/order';

export type Tone = 'ok' | 'warn' | 'info' | 'danger' | 'brand' | 'neutral';

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Pendente', tone: 'warn' },
  PAID: { label: 'Pago', tone: 'info' },
  SHIPPED: { label: 'Enviado', tone: 'brand' },
  DELIVERED: { label: 'Entregue', tone: 'ok' },
  CANCELED: { label: 'Cancelado', tone: 'danger' },
};

@Pipe({ name: 'orderStatus', standalone: true })
export class OrderStatusPipe implements PipeTransform {
  transform(status: OrderStatus): string { return ORDER_STATUS[status].label; }
}
