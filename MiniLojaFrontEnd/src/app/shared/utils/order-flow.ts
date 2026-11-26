import { OrderStatus } from '../models/order';

/** Transições válidas: PENDENTE → PAGO → ENVIADO → ENTREGUE (ou CANCELADO antes de entregar). */
const FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELED'],
  PAID: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED', 'CANCELED'],
  DELIVERED: [],
  CANCELED: [],
};

export function nextStatuses(status: OrderStatus): OrderStatus[] { return FLOW[status]; }
