import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PRODUCT } from '../../../testing/fixtures';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', PRODUCT);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra nome, categoria e % OFF', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Produto 01');
    expect(text).toContain('Categoria A');
    expect(text).toContain('20% OFF');
  });

  it('emite add ao clicar em Adicionar ao carrinho', () => {
    let emitted: unknown;
    fixture.componentInstance.add.subscribe((p) => (emitted = p));
    (fixture.nativeElement.querySelector('button[uiButton]') as HTMLButtonElement).click();
    expect(emitted).toEqual(PRODUCT);
  });

  it('desabilita o botão quando está sem estoque', () => {
    fixture.componentRef.setInput('product', { ...PRODUCT, stock: 0 });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[uiButton]') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
    expect(btn.textContent).toContain('Sem estoque');
  });
});
