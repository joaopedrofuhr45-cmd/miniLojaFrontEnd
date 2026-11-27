import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('get busca por id', () => {
    service.get(7).subscribe();
    http.expectOne(`${api}/products/7`).flush({});
  });

  it('byCategory filtra por categoria e limita o tamanho', () => {
    service.byCategory(3, 5).subscribe();
    const req = http.expectOne((r) => r.url === `${api}/products`);
    expect(req.request.params.get('category')).toBe('3');
    expect(req.request.params.get('size')).toBe('5');
    req.flush({ content: [], totalPages: 0 });
  });
});
