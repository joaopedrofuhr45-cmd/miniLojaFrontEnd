import { discountPct, installments, MIN_INSTALLMENT } from './price';

describe('price utils', () => {
  describe('discountPct', () => {
    it('calcula o desconto arredondado', () => {
      expect(discountPct(49.9, 62.4)).toBe(20);
    });
    it('é 0 sem preço original ou quando não há desconto', () => {
      expect(discountPct(50, null)).toBe(0);
      expect(discountPct(50, undefined)).toBe(0);
      expect(discountPct(50, 50)).toBe(0);
      expect(discountPct(60, 50)).toBe(0);
    });
  });

  describe('installments', () => {
    it('respeita o valor mínimo da parcela', () => {
      expect(installments(MIN_INSTALLMENT * 3)).toBe(3);
    });
    it('limita ao máximo de parcelas', () => {
      expect(installments(1000)).toBe(10);
      expect(installments(1000, 12)).toBe(12);
    });
    it('nunca é menor que 1', () => {
      expect(installments(1)).toBe(1);
    });
  });
});
