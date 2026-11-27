import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CartService } from '@core/cart/services/cart.service';
import { environment } from '@environment/environment';
import { ORDER, PRODUCT } from '@testing/fixtures';
import { CheckoutFacade } from './checkout.facade';

describe('CheckoutFacade', () => {
  let facade: CheckoutFacade;
  let cart: CartService;
  let http: HttpTestingController;
  let nav: jasmine.Spy;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [CheckoutFacade, provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    facade = TestBed.inject(CheckoutFacade);
    cart = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);
    nav = spyOn(TestBed.inject(Router), 'navigate');
  });

  it('carrinho vazio volta para /carrinho', () => {
    facade.redirectIfCartEmpty();
    expect(nav).toHaveBeenCalledWith(['/carrinho']);
  });

  it('confirm cria o pedido, limpa o carrinho e abre /pedidos', async () => {
    cart.add(PRODUCT, 2);
    const done = facade.confirm(ORDER.address, 'PIX');
    const req = http.expectOne(`${environment.apiUrl}/orders`);
    expect(req.request.body.items).toEqual([{ productId: PRODUCT.id, quantity: 2 }]);
    req.flush(ORDER);
    expect(await done).toBeNull();
    expect(cart.count()).toBe(0);
    expect(nav).toHaveBeenCalledWith(['/pedidos']);
  });

  it('erro do back mantém o carrinho e devolve a mensagem', async () => {
    cart.add(PRODUCT);
    const done = facade.confirm(ORDER.address, 'PIX');
    http.expectOne(`${environment.apiUrl}/orders`).flush({ message: 'Estoque insuficiente' }, { status: 409, statusText: 'Conflict' });
    expect((await done)?.message).toBe('Estoque insuficiente');
    expect(cart.count()).toBe(1);
    expect(facade.busy()).toBeFalse();
    expect(facade.error()).toBe('Estoque insuficiente');
  });
});
