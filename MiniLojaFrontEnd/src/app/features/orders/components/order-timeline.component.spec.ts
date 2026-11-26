import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderTimelineComponent } from './order-timeline.component';

describe('OrderTimelineComponent', () => {
  let fixture: ComponentFixture<OrderTimelineComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [OrderTimelineComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTimelineComponent);
    fixture.componentRef.setInput('status', 'PAID');
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('descreve a etapa atual no aria-label', () => {
    expect(fixture.nativeElement.querySelector('ol').getAttribute('aria-label')).toContain('Pago');
  });

  it('não marca etapa atual em pedido cancelado', () => {
    fixture.componentRef.setInput('status', 'CANCELED');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-current]')).toBeNull();
  });
});
