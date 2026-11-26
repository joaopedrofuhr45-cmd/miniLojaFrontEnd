import { Component, input } from '@angular/core';
import { Tone } from '../pipes/order-status.pipe';

@Component({
  selector: 'ui-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  host: { '[attr.data-tone]': 'tone()' },
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly tone = input<Tone>('neutral');
}
