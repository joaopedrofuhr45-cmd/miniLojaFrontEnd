import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

interface Slide { tag: string; title: string; text: string; cta: string; hover: string; query: Record<string, string | number>; bg: string; }

const SLIDES: Slide[] = [
  { tag: 'OFERTAS DA SEMANA', title: 'Até 30% OFF em produtos selecionados', text: 'Frete grátis acima de R$ 199 e parcelamento em até 10x sem juros.', cta: 'Ver ofertas', hover: 'Bora economizar', query: { desconto: 1 }, bg: 'linear-gradient(100deg, #2b3527 0%, #3a4a33 50%, #5c6e50 100%)' },
  { tag: 'LANÇAMENTOS', title: 'Novidades chegando toda semana', text: 'Veja primeiro o que acabou de entrar no catálogo.', cta: 'Ver lançamentos', hover: 'Quero ver primeiro', query: { ordem: 'lancamentos' }, bg: 'linear-gradient(100deg, #232b20 0%, #2b3527 50%, #4b5a44 100%)' },
  { tag: 'MENOR PREÇO', title: 'Achados para o seu bolso', text: 'Ordene do menor preço e compre sem pesar no orçamento.', cta: 'Ver menores preços', hover: 'Quero pagar menos', query: { ordem: 'menor-preco' }, bg: 'linear-gradient(100deg, #3a2a1e 0%, #6b4a33 50%, #b57a52 100%)' },
];

const AUTOPLAY_MS = 6500;

/** Banner da home: troca sozinho de slide (e de cor), pausa com mouse/foco e respeita movimento reduzido. */
@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
})
export class HeroBannerComponent {
  protected readonly slides = SLIDES;
  protected readonly autoplayMs = AUTOPLAY_MS;
  protected readonly i = signal(0);
  protected readonly paused = signal(false);

  constructor() {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      if (!this.paused()) this.i.update((n) => (n + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected slide(): Slide { return SLIDES[this.i()]; }

  protected go(n: number): void { this.i.set(n); }
}
