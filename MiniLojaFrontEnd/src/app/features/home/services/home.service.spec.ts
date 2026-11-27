import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(HomeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca as ofertas com onSale e o tamanho da vitrine', () => {
    service.products({ onSale: true, size: 4 }).subscribe();
    const req = http.expectOne((r) => r.url === `${api}/products`);
    expect(req.request.params.get('onSale')).toBe('true');
    expect(req.request.params.get('size')).toBe('4');
    req.flush({ content: [], totalPages: 0 });
  });
});
