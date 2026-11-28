import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterPage } from './register.page';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve ter o link para a outra tela', () => {
    const href = (fixture.nativeElement as HTMLElement).querySelector('.switch a')?.getAttribute('href');
    expect(href).toBe('/entrar');
  });
});
