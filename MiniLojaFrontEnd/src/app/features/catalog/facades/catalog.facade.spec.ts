import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { environment } from '@environment/environment';
import { of } from 'rxjs';
import { CatalogFacade } from './catalog.facade';

describe('CatalogFacade', () => {
  const setup = (query: Record<string, string>) => {
    TestBed.configureTestingModule({
      providers: [
        CatalogFacade, provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap(query)), snapshot: { queryParamMap: convertToParamMap(query) } } },
      ],
    });
    return { facade: TestBed.inject(CatalogFacade), http: TestBed.inject(HttpTestingController) };
  };

  it('lê os filtros da URL', () => {
    const { facade } = setup({ q: 'abc', categoria: '2', ate: '100', desconto: '1', ordem: 'menor-preco', page: '3' });
    expect(facade.f()).toEqual({ q: 'abc', categoria: 2, de: null, ate: 100, desconto: true, ordem: 'menor-preco', page: 3 });
  });

  it('ignora ordem inválida e página menor que 1', () => {
    const { facade } = setup({ ordem: 'xxx', page: '-4' });
    expect(facade.f().ordem).toBe('relevantes');
    expect(facade.f().page).toBe(1);
  });

  it('manda os filtros para a API e vira ok com a resposta', () => {
    const { facade, http } = setup({ categoria: '2', ordem: 'maior-preco', page: '2' });
    TestBed.flushEffects();
    const req = http.expectOne((r) => r.url === `${environment.apiUrl}/products`);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('category')).toBe('2');
    expect(req.request.params.get('sort')).toBe('price_desc');
    req.flush({ content: [], totalPages: 0, totalElements: 0 });
    expect(facade.state().status).toBe('ok');
  });

  it('set() navega só com o que mudou', () => {
    const { facade } = setup({});
    const nav = spyOn(TestBed.inject(Router), 'navigate');
    facade.set({ categoria: 3, page: null });
    expect(nav).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { categoria: 3, page: null }, queryParamsHandling: 'merge' }));
  });
});
