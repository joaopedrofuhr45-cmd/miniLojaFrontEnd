import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-logo',
  standalone: true,
  template: `Mini<span>Loja</span>`,
  host: { '[attr.data-on]': 'on()' },
  styles: [`
    :host { font-weight: 800; font-size: 26px; letter-spacing: -.02em; line-height: 1; }
    :host([data-on='dark']) { color: #fff; } :host([data-on='dark']) span { color: var(--accent); }
    :host([data-on='light']) { color: var(--brand); } :host([data-on='light']) span { color: var(--cta); }
  `],
})
export class LogoComponent {
  /** dark = sobre fundo escuro (header); light = sobre fundo claro (footer). */
  readonly on = input<'dark' | 'light'>('dark');
}
