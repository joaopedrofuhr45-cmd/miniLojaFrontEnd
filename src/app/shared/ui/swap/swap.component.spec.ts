import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwapComponent } from './swap.component';

describe('SwapComponent', () => {
  let fixture: ComponentFixture<SwapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SwapComponent] }).compileComponents();
    fixture = TestBed.createComponent(SwapComponent);
    fixture.componentRef.setInput('text', 'Entrar');
    fixture.componentRef.setInput('hover', 'Vamos lá');
    fixture.detectChanges();
  });

  it('mostra o texto e o texto do hover', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.a')?.textContent).toBe('Entrar');
    expect(el.querySelector('.b')?.textContent).toBe('Vamos lá');
  });

  it('esconde o texto do hover de leitores de tela', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.b')?.getAttribute('aria-hidden')).toBe('true');
  });
});
