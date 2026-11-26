import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list envia página, tamanho e filtros', () => {
    service.list({ page: 1, size: 4, search: 'abc', category: 2, onSale: true, sort: 'price_asc' }).subscribe();
    const req = http.expectOne((r) => r.url === `${api}/products`);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('4');
    expect(req.request.params.get('search')).toBe('abc');
    expect(req.request.params.get('category')).toBe('2');
    expect(req.request.params.get('onSale')).toBe('true');
    expect(req.request.params.get('sort')).toBe('price_asc');
    req.flush({ content: [], totalPages: 0 });
  });

  it('list usa page 0 e size 8 por padrão e não manda filtros vazios', () => {
    service.list().subscribe();
    const req = http.expectOne((r) => r.url === `${api}/products`);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('8');
    expect(req.request.params.has('search')).toBeFalse();
    req.flush({ content: [], totalPages: 0 });
  });

  it('get busca por id', () => {
    service.get(7).subscribe();
    http.expectOne(`${api}/products/7`).flush({});
  });
});
