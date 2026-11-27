import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRODUCT } from '../../../../testing/fixtures';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  let store: CartStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(CartStore);
  });

  it('começa vazio, sem frete', () => {
    expect(store.count()).toBe(0);
    expect(store.shipping()).toBe(0);
    expect(store.total()).toBe(0);
  });

  it('adiciona e soma a quantidade do mesmo produto', () => {
    store.add(PRODUCT);
    store.add(PRODUCT, 2);
    expect(store.items().length).toBe(1);
    expect(store.count()).toBe(3);
    expect(store.subtotal()).toBeCloseTo(PRODUCT.price * 3);
  });

  it('não passa do estoque', () => {
    store.add(PRODUCT, 999);
    expect(store.items()[0].quantity).toBe(PRODUCT.stock);
  });

  it('ignora produto sem estoque', () => {
    store.add({ ...PRODUCT, stock: 0 });
    expect(store.items()).toEqual([]);
  });

  it('setQuantity limita ao estoque e remove com quantidade menor que 1', () => {
    store.add(PRODUCT);
    store.setQuantity(PRODUCT.id, 999);
    expect(store.items()[0].quantity).toBe(PRODUCT.stock);
    store.setQuantity(PRODUCT.id, 0);
    expect(store.items()).toEqual([]);
  });

  it('remove e limpa', () => {
    store.add(PRODUCT);
    store.remove(PRODUCT.id);
    expect(store.count()).toBe(0);
    store.add(PRODUCT);
    store.clear();
    expect(store.count()).toBe(0);
  });

  it('soma o frete ao total e zera acima do mínimo do frete grátis', () => {
    store.add({ ...PRODUCT, price: 10 });
    expect(store.shipping()).toBeGreaterThan(0);
    expect(store.total()).toBe(store.subtotal() + store.shipping());
    store.add({ ...PRODUCT, price: 10, stock: 9999 }, 9000);
    expect(store.shipping()).toBe(0);
    expect(store.freeShippingProgress()).toBe(100);
    expect(store.missingForFreeShipping()).toBe(0);
  });

  it('persiste no localStorage', () => {
    store.add(PRODUCT);
    TestBed.flushEffects();
    expect(JSON.parse(localStorage.getItem('miniloja.cart')!).length).toBe(1);
  });
});
