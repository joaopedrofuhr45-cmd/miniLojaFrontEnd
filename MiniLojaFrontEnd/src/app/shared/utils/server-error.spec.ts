import { HttpErrorResponse } from '@angular/common/http';
import { toServerError } from './server-error';

describe('toServerError', () => {
  it('sem conexão (status 0)', () => {
    expect(toServerError(new HttpErrorResponse({ status: 0 }), 'x').message).toContain('Sem conexão');
  });

  it('erro 5xx não expõe a mensagem do back', () => {
    const e = new HttpErrorResponse({ status: 500, error: { message: 'stacktrace' } });
    expect(toServerError(e, 'x').message).toContain('do nosso lado');
  });

  it('usa a mensagem e os campos do back em 4xx', () => {
    const e = new HttpErrorResponse({ status: 422, error: { message: 'Estoque insuficiente', fields: [{ field: 'name', message: 'obrigatório' }] } });
    const r = toServerError(e, 'x');
    expect(r.message).toBe('Estoque insuficiente');
    expect(r.fields).toEqual([{ field: 'name', message: 'obrigatório' }]);
  });

  it('usa o texto padrão quando o back não manda mensagem', () => {
    expect(toServerError(new HttpErrorResponse({ status: 400 }), 'Falhou').message).toBe('Falhou');
  });
});
