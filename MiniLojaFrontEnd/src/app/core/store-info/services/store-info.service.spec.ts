import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { StoreInfoService } from './store-info.service';

describe('StoreInfoService', () => {
  let service: StoreInfoService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(StoreInfoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('começa com os valores padrão e atualiza com a resposta do back', () => {
    expect(service.info().freeShippingThreshold).toBe(199);
    http.expectOne(`${api}/store-info`).flush({ freeShippingThreshold: 300, shippingFee: 20, maxInstallments: 6, returnDays: 7 });
    expect(service.info().freeShippingThreshold).toBe(300);
  });

  it('shippingFor zera o frete acima do mínimo', () => {
    http.expectOne(`${api}/store-info`).flush({ freeShippingThreshold: 100, shippingFee: 20, maxInstallments: 6, returnDays: 7 });
    expect(service.shippingFor(99)).toBe(20);
    expect(service.shippingFor(100)).toBe(0);
  });
});
