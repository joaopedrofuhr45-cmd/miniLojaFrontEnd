import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ORDER } from '../../../../../testing/fixtures';
import { OrderCardComponent } from './order-card.component';

describe('OrderCardComponent', () => {
  let fixture: ComponentFixture<OrderCardComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [OrderCardComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCardComponent);
    fixture.componentRef.setInput('order', ORDER);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('resume os itens e mostra o número do pedido', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Produto 01 e mais 2 produtos');
    expect(text).toContain('Pedido #1042');
  });

  it('só mostra Cancelar pedido em pedidos pendentes quando aberto', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Cancelar pedido');
    fixture.componentRef.setInput('order', { ...ORDER, status: 'PENDING' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cancelar pedido');
  });
});
