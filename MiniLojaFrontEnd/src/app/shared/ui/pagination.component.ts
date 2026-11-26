import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

/** Paginação 1-based. */
@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (totalPages() > 1) {
      <nav aria-label="Paginação">
        <button type="button" aria-label="Página anterior" [disabled]="page() <= 1" (click)="go(page() - 1)"><ui-icon name="chevron-left" [size]="14" /></button>
        @for (p of pages(); track p) {
          <button type="button" [class.active]="p === page()" [attr.aria-current]="p === page() ? 'page' : null" (click)="go(p)">{{ p }}</button>
        }
        <button type="button" aria-label="Próxima página" [disabled]="page() >= totalPages()" (click)="go(page() + 1)"><ui-icon name="chevron-right" [size]="14" /></button>
      </nav>
    }`,
  styles: [`
    nav { display: flex; justify-content: center; gap: 6px; }
    button { min-width: 34px; height: 34px; padding: 0 8px; display: inline-grid; place-items: center; background: #fff; border: 1px solid var(--line); border-radius: var(--radius); font-weight: 600; }
    button:hover:not(:disabled) { border-color: var(--brand); }
    button.active { background: var(--brand); border-color: var(--brand); color: #fff; }
    button:disabled { opacity: .45; cursor: not-allowed; }
  `],
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();
  protected readonly pages = computed(() => {
    const total = this.totalPages(); const from = Math.max(1, Math.min(this.page() - 2, total - 4));
    return Array.from({ length: Math.min(5, total) }, (_, i) => from + i);
  });
  protected go(p: number): void { if (p >= 1 && p <= this.totalPages() && p !== this.page()) this.pageChange.emit(p); }
}
