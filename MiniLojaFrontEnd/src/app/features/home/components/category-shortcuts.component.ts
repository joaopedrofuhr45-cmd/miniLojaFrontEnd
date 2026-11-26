import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../shared/models/category';
import { ProductThumbComponent } from '../../../shared/ui/product-thumb.component';

interface Shortcut { label: string; query: Record<string, string | number>; tint: number; }

@Component({
  selector: 'app-category-shortcuts',
  standalone: true,
  imports: [RouterLink, ProductThumbComponent],
  template: `
    <ul class="card">
      @for (s of shortcuts(); track s.label) {
        <li>
          <a routerLink="/catalogo" [queryParams]="s.query">
            <span class="circle"><ui-product-thumb [seed]="s.tint" [iconSize]="30" /></span>
            {{ s.label }}
          </a>
        </li>
      }
    </ul>`,
  styles: [`
    ul { display: flex; justify-content: space-around; gap: 16px; padding: 20px; overflow-x: auto; }
    a { display: grid; justify-items: center; gap: 10px; color: var(--ink); font-size: 13px; white-space: nowrap; }
    .circle { display: block; width: 60px; height: 60px; border-radius: 50%; overflow: hidden; }
  `],
})
export class CategoryShortcutsComponent {
  readonly categories = input.required<Category[]>();
  protected readonly shortcuts = computed<Shortcut[]>(() => [
    ...this.categories().slice(0, 3).map((c, i): Shortcut => ({ label: c.name, query: { categoria: c.id }, tint: i + 1 })),
    { label: 'Ofertas', query: { desconto: 1 }, tint: 4 } as Shortcut,
    { label: 'Lançamentos', query: { ordem: 'lancamentos' }, tint: 6 } as Shortcut,
  ]);
}
