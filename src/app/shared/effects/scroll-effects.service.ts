import { Injectable, NgZone, inject } from '@angular/core';

/**
 * Efeitos ligados ao scroll, feitos para custar quase nada:
 *  - nada de variáveis CSS na raiz (mudar uma variável herdada recalcula o estilo da página inteira);
 *  - a barra de progresso é movida direto por `transform` (só compositor, sem layout nem pintura);
 *  - cores de header e fundo mudam por classe no <html>, só quando o scroll cruza um limite,
 *    e quem anima a cor é uma `transition` do CSS (por tempo, não por quadro de scroll);
 *  - tudo roda fora do NgZone, para o Angular não rodar detecção de mudanças a cada scroll.
 */
@Injectable({ providedIn: 'root' })
export class ScrollEffectsService {
  private readonly zone = inject(NgZone);
  private started = false;

  start(bar: HTMLElement | null): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;

    this.zone.runOutsideAngular(() => {
      const root = document.documentElement;
      let max = 1;
      let queued = false;
      let scrolled = false;
      let far = false;
      let lastP = -1;

      const measure = () => {
        max = Math.max(root.scrollHeight - window.innerHeight, 1);
      };
      const update = () => {
        queued = false;
        const y = window.scrollY;
        const p = Math.min(y / max, 1);
        if (bar && Math.abs(p - lastP) > 0.001) {
          lastP = p;
          bar.style.transform = `translate3d(${(p - 1) * 100}%,0,0)`;
        }
        const s = y > 8;
        if (s !== scrolled) root.classList.toggle('scrolled', (scrolled = s));
        const f = y > 480;
        if (f !== far) root.classList.toggle('scrolled-far', (far = f));
      };
      const schedule = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      };

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', () => { measure(); schedule(); }, { passive: true });
      // a altura da página muda quando o conteúdo carrega: re-mede sem ler layout a cada scroll
      if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); schedule(); }).observe(document.body);
      measure();
      update();
    });
  }
}
