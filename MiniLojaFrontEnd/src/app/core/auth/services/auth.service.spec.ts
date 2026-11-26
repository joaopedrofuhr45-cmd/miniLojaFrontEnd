import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const res = { token: 't0k', user: { id: 1, name: 'João Pedro', email: 'j@x.com', role: 'ADMIN' } } as never;

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

  it('login faz POST /auth/login', () => {
    service.login({ email: 'a@b.com', password: '123' }).subscribe();
    const req = http.expectOne(`${api}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(res);
  });
});
