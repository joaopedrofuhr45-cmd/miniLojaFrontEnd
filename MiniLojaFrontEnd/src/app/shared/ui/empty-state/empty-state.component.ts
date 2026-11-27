import { Component, input } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';

/** Estado vazio ou de erro de qualquer lista. Ações vão no <ng-content>. */
@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly icon = input('cube');
  readonly title = input.required<string>();
  readonly message = input('');
}
