import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OrdersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('mine envia status e paginação', () => {
    service.mine({ page: 2, status: 'PAID' }).subscribe();
    const req = http.expectOne((r) => r.url === `${api}/orders/me`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('status')).toBe('PAID');
    req.flush({ content: [], totalPages: 0 });
  });

  it('cancel usa PATCH /orders/:id/cancel', () => {
    service.cancel(5).subscribe();
    const req = http.expectOne(`${api}/orders/5/cancel`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
