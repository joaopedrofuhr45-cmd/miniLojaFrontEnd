import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartPage } from './cart.page';

describe('CartPage', () => {
  let fixture: ComponentFixture<CartPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
