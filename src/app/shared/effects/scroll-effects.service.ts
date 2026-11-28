import { Injectable } from '@angular/core';

/**
 * Publica a posição do scroll como variáveis CSS no <html>, para qualquer estilo reagir a ela:
 *  --scroll    0..1 do progresso na página (barra do topo, cor do fundo, degradê do banner)
 *  --scroll-y  pixels rolados, sem unidade (parallax: calc(var(--scroll-y) * -0.1px))
 *  --hdr-t     0..1 nos primeiros 160px (header escurece e encolhe)
 * e liga a classe `scrolled` quando a página saiu do topo.
 */
@Injectable({ providedIn: 'root' })
export class ScrollEffectsService {
  private started = false;

  start(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    const root = document.documentElement;
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      const max = Math.max(root.scrollHeight - window.innerHeight, 1);
      root.style.setProperty('--scroll', Math.min(y / max, 1).toFixed(4));
      root.style.setProperty('--scroll-y', y.toFixed(0));
      root.style.setProperty('--hdr-t', Math.min(y / 160, 1).toFixed(3));
      root.classList.toggle('scrolled', y > 8);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  }
}
