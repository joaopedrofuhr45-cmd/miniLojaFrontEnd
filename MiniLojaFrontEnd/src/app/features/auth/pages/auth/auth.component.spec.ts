import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra só um formulário por vez (entrar por padrão)', () => {
    const cards = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('section.card')) as HTMLElement[];
    const visible = cards.filter((c) => !c.classList.contains('hide')).map((c) => c.querySelector('h1')!.textContent);
    expect(visible).toEqual(['Que bom te ver de novo']);
  });
});
