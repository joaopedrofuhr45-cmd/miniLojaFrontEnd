import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CART_ITEM } from '@testing/fixtures';
import { CartItemRowComponent } from './cart-item-row.component';

describe('CartItemRowComponent', () => {
  let fixture: ComponentFixture<CartItemRowComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CartItemRowComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CartItemRowComponent);
    fixture.componentRef.setInput('item', CART_ITEM);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emite a nova quantidade ao aumentar e diminuir', () => {
    const values: number[] = [];
    fixture.componentInstance.quantityChange.subscribe((q) => values.push(q));
    (fixture.nativeElement.querySelector('button[aria-label="Aumentar"]') as HTMLButtonElement).click();
    (fixture.nativeElement.querySelector('button[aria-label="Diminuir"]') as HTMLButtonElement).click();
    expect(values).toEqual([3, 1]);
  });

  it('emite remove', () => {
    let removed = false;
    fixture.componentInstance.remove.subscribe(() => (removed = true));
    (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]).find((b) => b.textContent?.trim() === 'Remover')!.click();
    expect(removed).toBeTrue();
  });
});
