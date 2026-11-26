import { OrderStatus } from '../../models/order';
import { ORDER_STATUS, OrderStatusPipe } from './order-status.pipe';

describe('OrderStatusPipe', () => {
  const pipe = new OrderStatusPipe();

  it('traduz cada status', () => {
    const esperado: Record<OrderStatus, string> = {
      PENDING: 'Pendente', PAID: 'Pago', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELED: 'Cancelado',
    };
    for (const [status, label] of Object.entries(esperado)) {
      expect(pipe.transform(status as OrderStatus)).toBe(label);
    }
  });

  it('cancelado usa o tom de perigo', () => {
    expect(ORDER_STATUS.CANCELED.tone).toBe('danger');
  });
});
