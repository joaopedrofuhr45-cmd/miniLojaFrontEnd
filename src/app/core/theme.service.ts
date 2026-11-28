import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'dark' | 'light';
const KEY = 'miniloja.theme';

/** Tema claro/escuro. Guarda só a preferência (não é dado sensível); sem preferência, segue o sistema. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initial());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.dataset['theme'] = t;
      try { localStorage.setItem(KEY, t); } catch { /* storage indisponível */ }
    });
  }

  toggle(): void { this.theme.set(this.theme() === 'dark' ? 'light' : 'dark'); }

  private initial(): Theme {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch { /* storage indisponível */ }
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}
