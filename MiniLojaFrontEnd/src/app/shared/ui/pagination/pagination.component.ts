import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from '@shared/ui/icon/icon.component';

/** Paginação 1-based. */
@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
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
