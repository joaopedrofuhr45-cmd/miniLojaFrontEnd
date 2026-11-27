import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PriceBlockComponent } from '@shared/ui/price-block/price-block.component';

describe('PriceBlockComponent', () => {
  let fixture: ComponentFixture<PriceBlockComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PriceBlockComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceBlockComponent);
    fixture.componentRef.setInput('price', 1);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra desconto e parcelas quando há preço original', () => {
    fixture.componentRef.setInput('price', 49.9);
    fixture.componentRef.setInput('originalPrice', 62.4);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('20% OFF');
    expect(text).toContain('em 9x');
  });

  it('não mostra desconto sem preço original', () => {
    fixture.componentRef.setInput('price', 49.9);
    fixture.componentRef.setInput('originalPrice', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('OFF');
  });
});
