import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login faz POST /auth/login', () => {
    service.login({ email: 'a@b.com', password: '123' }).subscribe();
    const req = http.expectOne(`${api}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.com', password: '123' });
    req.flush({});
  });

  it('register faz POST /auth/register', () => {
    service.register({ name: 'A', email: 'a@b.com', password: '12345678' }).subscribe();
    const req = http.expectOne(`${api}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
