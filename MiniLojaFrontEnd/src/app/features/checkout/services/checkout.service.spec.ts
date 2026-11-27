import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CheckoutService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('create faz POST /orders', () => {
    service.create({ items: [], address: {} as never, paymentMethod: 'PIX' }).subscribe();
    const req = http.expectOne(`${api}/orders`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('profile busca GET /users/me', () => {
    service.profile().subscribe();
    http.expectOne(`${api}/users/me`).flush({});
  });
});
