import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    @if (open()) {
      <div class="backdrop" (click)="closed.emit()"></div>
      <div class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <h2>{{ title() }}</h2>
        <div class="content"><ng-content /></div>
        <footer><ng-content select="[actions]" /></footer>
      </div>
    }`,
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(0, 0, 0, .45); }
    .dialog { position: fixed; z-index: 51; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(420px, calc(100% - 32px)); padding: 24px; background: #fff; border-radius: 10px; box-shadow: 0 12px 40px rgba(0, 0, 0, .25); }
    h2 { font-size: 18px; margin-bottom: 8px; } .content { color: var(--ink2); }
    footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
  `],
})
export class ModalComponent {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly closed = output<void>();
}
