import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly closed = output<void>();
}
