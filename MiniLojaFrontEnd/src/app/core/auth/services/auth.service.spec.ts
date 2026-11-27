import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const res = { token: 't0k', user: { id: 1, name: 'João Pedro', email: 'j@x.com', role: 'ADMIN' } } as never;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(AuthService);
  });

  it('começa deslogado', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.token()).toBeNull();
  });

  it('startSession guarda a sessão e logout limpa', () => {
    service.startSession(res);
    TestBed.flushEffects();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.isAdmin()).toBeTrue();
    expect(service.firstName()).toBe('João');
    expect(localStorage.getItem('miniloja.auth')).toContain('t0k');
    service.logout();
    TestBed.flushEffects();
    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('miniloja.auth')).toBeNull();
  });
});
