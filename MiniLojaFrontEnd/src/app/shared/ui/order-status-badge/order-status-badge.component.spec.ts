import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderStatusBadgeComponent } from '@shared/ui/order-status-badge/order-status-badge.component';

describe('OrderStatusBadgeComponent', () => {
  let fixture: ComponentFixture<OrderStatusBadgeComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [OrderStatusBadgeComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'PAID');
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra o status em português e maiúsculas', () => {
    expect(fixture.nativeElement.textContent).toContain('PAGO');
  });
});
