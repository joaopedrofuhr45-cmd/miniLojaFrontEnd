import { Injectable } from '@angular/core';

/**
 * Faz os blocos "aparecerem" quando entram na tela, em todas as páginas, sem precisar marcar
 * cada template. O que entra junto na tela aparece em sequência (efeito escalonado).
 *
 * - Só o elemento mais externo de cada bloco anima (filhos de um bloco já marcado são ignorados).
 * - `data-no-reveal` em um elemento (ou ancestral) desliga o efeito.
 * - Com `prefers-reduced-motion: reduce` nada é escondido nem animado.
 * - Depois de animar, as classes saem do elemento, então não atrapalham hover/transform próprios.
 */
const SELECTOR = [
  '.card',
  'ui-product-card',
  '.section-title',
  '.page-head',
  '.head',
  '.breadcrumb',
  '.table-wrap',
  '.cols > *',
  '.layout > *',
].join(',');

@Injectable({ providedIn: 'root' })
export class RevealService {
  private started = false;

  start(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        const batch = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        batch.forEach((entry, i) => {
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const delay = Math.min(i * 70, 420);
          el.style.setProperty('--rv-delay', `${delay}ms`);
          requestAnimationFrame(() => el.classList.add('rv-in'));
          setTimeout(() => {
            el.classList.remove('rv', 'rv-in');
            el.style.removeProperty('--rv-delay');
          }, delay + 1000);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    );

    const mark = (el: HTMLElement) => {
      if (el.dataset['rv'] || el.closest('[data-no-reveal], [role="dialog"]')) return;
      if (el.parentElement?.closest('[data-rv]')) return; // já faz parte de um bloco que anima
      if (!el.offsetWidth && !el.offsetHeight) return; // sem tamanho: o observer nunca dispararia
      el.dataset['rv'] = '1';
      el.classList.add('rv');
      io.observe(el);
    };
    const scan = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(SELECTOR)) mark(root);
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach(mark);
    };

    let pending: Node[] = [];
    let queued = false;
    const flush = () => {
      queued = false;
      const nodes = pending;
      pending = [];
      nodes.forEach((n) => n.isConnected && scan(n as HTMLElement));
    };
    new MutationObserver((mutations) => {
      for (const m of mutations) m.addedNodes.forEach((n) => n.nodeType === 1 && pending.push(n));
      if (pending.length && !queued) {
        queued = true;
        queueMicrotask(flush); // antes da próxima pintura: o bloco nasce já escondido, sem piscar
      }
    }).observe(document.body, { childList: true, subtree: true });

    scan(document.body);
  }
}
