import { Component, input } from '@angular/core';
import { Tone } from '../pipes/order-status.pipe';

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: '<ng-content />',
  host: { '[attr.data-tone]': 'tone()' },
  styles: [`
    :host { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .02em; white-space: nowrap; }
    :host([data-tone='ok']) { background: var(--ok-soft); color: var(--ok); }
    :host([data-tone='warn']) { background: var(--warn-soft); color: var(--warn); }
    :host([data-tone='info']) { background: var(--info-soft); color: var(--info); }
    :host([data-tone='danger']) { background: var(--danger-soft); color: var(--danger); }
    :host([data-tone='brand']) { background: var(--brand-soft); color: var(--brand); }
    :host([data-tone='neutral']) { background: #ececec; color: var(--ink2); }
  `],
})
export class BadgeComponent {
  readonly tone = input<Tone>('neutral');
}
