import { BrlPipe } from '@shared/pipes/brl/brl.pipe';

describe('BrlPipe', () => {
  const pipe = new BrlPipe();
  const norm = (s: string) => s.replace(/\s/g, ' ');

  it('formata em reais com duas casas', () => {
    expect(norm(pipe.transform(1234.5))).toBe('R$ 1.234,50');
  });

  it('aceita zero casas decimais', () => {
    expect(norm(pipe.transform(49.9, 0))).toBe('R$ 50');
  });

  it('trata null e undefined como zero', () => {
    expect(norm(pipe.transform(null))).toBe('R$ 0,00');
    expect(norm(pipe.transform(undefined))).toBe('R$ 0,00');
  });
});
