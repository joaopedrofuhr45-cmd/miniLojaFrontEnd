import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { IconComponent } from '../../../shared/ui/icon.component';

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
  template: `
    <section class="hero" aria-roledescription="carrossel">
      <div class="copy">
        <span class="tag">{{ slide().tag }}</span>
        <h1>{{ slide().title }}</h1>
        <p>{{ slide().text }}</p>
        <a uiButton variant="cta" size="lg" routerLink="/catalogo" [queryParams]="slide().query">{{ slide().cta }}</a>
      </div>
      <div class="art" aria-hidden="true">
        <span class="sq a"><ui-icon name="cube" [size]="44" [stroke]="1.4" /></span>
        <span class="sq b"><ui-icon name="cube" [size]="44" [stroke]="1.4" /></span>
        <span class="sq c"><ui-icon name="cube" [size]="44" [stroke]="1.4" /></span>
      </div>
      <div class="dots">
        @for (s of slides; track $index) {
          <button type="button" [class.on]="$index === i()" [attr.aria-label]="'Slide ' + ($index + 1)" [attr.aria-current]="$index === i()" (click)="i.set($index)"></button>
        }
      </div>
    </section>`,
  styles: [`
    .hero { position: relative; display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; min-height: 220px; padding: 32px 38px; border-radius: 8px; overflow: hidden; color: #fff;
      background: linear-gradient(100deg, #0d746d 0%, #0b6e69 45%, #8aa660 100%); }
    .copy { display: grid; gap: 14px; justify-items: start; }
    .tag { padding: 4px 12px; border-radius: 999px; background: rgba(255,255,255,.18); font-size: 10px; font-weight: 600; letter-spacing: .04em; }
    h1 { font-size: 38px; line-height: 1.1; font-weight: 700; letter-spacing: -.02em; max-width: 440px; } p { opacity: .95; }
    .art { position: relative; height: 180px; }
    .sq { position: absolute; display: grid; place-items: center; border-radius: 14px; background: rgba(255,255,255,.88); }
    .a { width: 116px; height: 116px; top: 0; left: 22%; color: #6c74f0; } .b { width: 116px; height: 116px; top: 28px; left: 52%; color: #ec4c9b; } .c { width: 96px; height: 96px; top: 82px; left: 32%; color: #2dbe85; }
    .dots { position: absolute; bottom: 12px; left: 50%; display: flex; gap: 6px; transform: translateX(-50%); }
    .dots button { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 50%; background: rgba(255,255,255,.5); } .dots button.on { background: #fff; }
    @media (max-width: 768px) { .hero { grid-template-columns: 1fr; padding: 24px 20px 32px; } h1 { font-size: 28px; } .art { display: none; } }
  `],
})
export class HeroBannerComponent {
  protected readonly slides = SLIDES;
  protected readonly i = signal(0);
  protected slide(): Slide { return SLIDES[this.i()]; }
}
