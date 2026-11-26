import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

interface Slide { tag: string; title: string; text: string; cta: string; query: Record<string, string | number>; }

const SLIDES: Slide[] = [
  { tag: 'OFERTAS DA SEMANA', title: 'Até 30% OFF em produtos selecionados', text: 'Frete grátis acima de R$ 199 e parcelamento em até 10x sem juros.', cta: 'Ver ofertas', query: { desconto: 1 } },
  { tag: 'LANÇAMENTOS', title: 'Novidades chegando toda semana', text: 'Veja primeiro o que acabou de entrar no catálogo.', cta: 'Ver lançamentos', query: { ordem: 'lancamentos' } },
  { tag: 'MENOR PREÇO', title: 'Achados para o seu bolso', text: 'Ordene do menor preço e compre sem pesar no orçamento.', cta: 'Ver menores preços', query: { ordem: 'menor-preco' } },
];

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
})
export class HeroBannerComponent {
  protected readonly slides = SLIDES;
  protected readonly i = signal(0);
  protected slide(): Slide { return SLIDES[this.i()]; }
}
