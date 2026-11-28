import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  host: { '[attr.data-on]': 'on()' },
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  /** dark = sobre fundo escuro (header); light = sobre fundo claro (footer). */
  readonly on = input<'dark' | 'light'>('dark');
}
