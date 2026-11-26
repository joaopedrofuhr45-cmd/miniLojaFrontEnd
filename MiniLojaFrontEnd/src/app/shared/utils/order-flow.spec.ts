import { nextStatuses } from './order-flow';

describe('nextStatuses', () => {
  it('segue PENDENTE → PAGO → ENVIADO → ENTREGUE, com cancelamento antes da entrega', () => {
    expect(nextStatuses('PENDING')).toEqual(['PAID', 'CANCELED']);
    expect(nextStatuses('PAID')).toEqual(['SHIPPED', 'CANCELED']);
    expect(nextStatuses('SHIPPED')).toEqual(['DELIVERED', 'CANCELED']);
  });

  it('estados finais não têm próximos', () => {
    expect(nextStatuses('DELIVERED')).toEqual([]);
    expect(nextStatuses('CANCELED')).toEqual([]);
  });
});
