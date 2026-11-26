import { Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

/** Estado vazio ou de erro de qualquer lista. Ações vão no <ng-content>. */
@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ui-icon [name]="icon()" [size]="40" [stroke]="1.4" />
    <h3>{{ title() }}</h3>
    @if (message()) { <p>{{ message() }}</p> }
    <ng-content />`,
  styles: [`
    :host { display: grid; justify-items: center; gap: 8px; padding: 48px 16px; text-align: center; color: var(--muted); }
    h3 { color: var(--ink); font-size: 18px; } p { max-width: 420px; }
  `],
})
export class EmptyStateComponent {
  readonly icon = input('cube');
  readonly title = input.required<string>();
  readonly message = input('');
}
