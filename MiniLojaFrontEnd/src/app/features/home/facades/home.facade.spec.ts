import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment/environment';
import { PRODUCT } from '@testing/fixtures';
import { HomeFacade } from './home.facade';

describe('HomeFacade', () => {
  let facade: HomeFacade;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HomeFacade, provideHttpClient(), provideHttpClientTesting()] });
    facade = TestBed.inject(HomeFacade);
    http = TestBed.inject(HttpTestingController);
  });

  it('começa carregando (null) e preenche as vitrines com a resposta', () => {
    expect(facade.offers()).toBeNull();
    http.expectOne((r) => r.url === `${environment.apiUrl}/products` && r.params.get('onSale') === 'true').flush({ content: [PRODUCT], totalPages: 1 });
    http.expectOne((r) => r.url === `${environment.apiUrl}/products` && r.params.get('sort') === 'newest').flush({ content: [], totalPages: 0 });
    expect(facade.offers()).toEqual([PRODUCT]);
    expect(facade.latest()).toEqual([]);
  });

  it('erro vira lista vazia em vez de quebrar a tela', () => {
    http.match((r) => r.url === `${environment.apiUrl}/products`).forEach((r) => r.flush('x', { status: 500, statusText: 'err' }));
    expect(facade.offers()).toEqual([]);
  });
});
